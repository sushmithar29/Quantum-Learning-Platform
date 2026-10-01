/* ============================================================
   QUANTUMLAB – PROGRESS STORE & SCHEDULE GENERATOR
   Centralized local persistence, multi-plan management,
   activity status tracking, streak calculation, and dynamic
   roadmap scheduling.
   ============================================================ */

window.QL = window.QL || {};

(function() {
  const STORAGE_KEY = 'quantumlab_progress_store_v1';
  const listeners = {};

  const DEFAULT_STORE = {
    plans: [],
    activePlanId: null,
    streak: 0,
    lastCompletedDate: null,
    allTimeCompletedActivities: []
  };

  /* ------------------------------------------------------------
     1. STORAGE ACCESS
     ------------------------------------------------------------ */
  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STORE };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STORE,
        ...parsed,
        plans: Array.isArray(parsed.plans) ? parsed.plans : []
      };
    } catch (e) {
      console.warn('[QuantumLab Progress] Failed to load store, initializing default', e);
      return { ...DEFAULT_STORE };
    }
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      emit('store_updated', store);
    } catch (e) {
      console.error('[QuantumLab Progress] Failed to save store', e);
    }
  }

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(fn => {
        try { fn(data); } catch (err) { console.error(err); }
      });
    }
  }

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  /* ------------------------------------------------------------
     2. DATE & DURATION CALCULATIONS
     ------------------------------------------------------------ */
  const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDateReadable(d) {
    const day = d.getDate();
    const month = MONTH_NAMES_SHORT[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function parseDateInput(str) {
    if (!str) return new Date();
    const parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(str);
  }

  function formatDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /* ------------------------------------------------------------
     3. PLAN GENERATOR ALGORITHM
     ------------------------------------------------------------ */
  function generatePlanSchedule(config) {
    const {
      name,
      topicIds = [],
      pace = 'steady',
      dailyStudyTimeMinutes = 60,
      studyDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      startDateStr = formatDateISO(new Date())
    } = config;

    // Collect all activities from selected topics
    const rawActivities = [];
    topicIds.forEach(tId => {
      const topic = QL.findTopicById(tId);
      if (topic && topic.activities) {
        topic.activities.forEach(a => {
          rawActivities.push({
            id: a.id,
            title: a.title,
            type: a.type,
            difficulty: a.difficulty,
            estimatedMinutes: a.estimatedMinutes || 25,
            route: a.route,
            topicId: topic.id,
            topicName: topic.name,
            category: topic.category,
            status: 'not_started',
            completedAt: null
          });
        });
      }
    });

    if (rawActivities.length === 0) {
      return null;
    }

    // Determine target daily minutes
    const targetMins = Math.max(20, dailyStudyTimeMinutes);

    // Group activities into logical study days
    const dayBuckets = [];
    let currentBucket = [];
    let currentMins = 0;

    rawActivities.forEach(act => {
      // If adding this exceeds 1.4x target and we already have at least 1 activity in bucket
      if (currentBucket.length > 0 && (currentMins + act.estimatedMinutes) > (targetMins * 1.35)) {
        dayBuckets.push([...currentBucket]);
        currentBucket = [act];
        currentMins = act.estimatedMinutes;
      } else {
        currentBucket.push(act);
        currentMins += act.estimatedMinutes;
      }
    });

    if (currentBucket.length > 0) {
      dayBuckets.push(currentBucket);
    }

    // Map day buckets to calendar dates matching studyDays
    const allowedDaysSet = new Set(studyDays.length > 0 ? studyDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    let cursorDate = parseDateInput(startDateStr);
    const scheduledDays = [];

    dayBuckets.forEach((bucketActivities, idx) => {
      // Advance cursor to next allowed study day
      while (!allowedDaysSet.has(DAY_NAMES_SHORT[cursorDate.getDay()])) {
        cursorDate.setDate(cursorDate.getDate() + 1);
      }

      const dayNumber = idx + 1;
      const dayDate = new Date(cursorDate);
      const totalDayMins = bucketActivities.reduce((acc, a) => acc + a.estimatedMinutes, 0);

      scheduledDays.push({
        id: `day-${dayNumber}`,
        dayNumber: dayNumber,
        date: formatDateISO(dayDate),
        formattedDate: formatDateReadable(dayDate),
        dayOfWeek: DAY_NAMES_SHORT[dayDate.getDay()],
        estimatedMinutes: totalDayMins,
        completed: false,
        activities: bucketActivities
      });

      // Advance one day for next iteration
      cursorDate.setDate(cursorDate.getDate() + 1);
    });

    const finalDay = scheduledDays[scheduledDays.length - 1];
    const totalActivities = rawActivities.length;

    // Estimate level based on content
    const hasAdvanced = rawActivities.some(a => a.difficulty === 'Advanced' || a.difficulty === 'Expert');
    const hasIntermediate = rawActivities.some(a => a.difficulty === 'Intermediate');
    const level = hasAdvanced ? 'Advanced' : (hasIntermediate ? 'Intermediate' : 'Beginner');

    return {
      id: 'plan-' + Date.now(),
      name: name || 'Quantum Learning Plan',
      pace: pace,
      level: level,
      status: 'active',
      createdAt: new Date().toISOString(),
      startDate: scheduledDays[0].date,
      formattedStartDate: scheduledDays[0].formattedDate,
      estimatedEndDate: finalDay.date,
      formattedEndDate: finalDay.formattedDate,
      durationDays: scheduledDays.length,
      dailyStudyTimeMinutes: targetMins,
      studyDays: Array.from(allowedDaysSet),
      topicIds: topicIds,
      totalActivities: totalActivities,
      completedActivities: 0,
      currentDayNumber: 1,
      days: scheduledDays
    };
  }

  /* ------------------------------------------------------------
     4. STORE API IMPLEMENTATION
     ------------------------------------------------------------ */
  const ProgressStore = {
    on: on,
    emit: emit,

    getStore: function() {
      return loadStore();
    },

    getActivePlan: function() {
      const store = loadStore();
      if (!store.activePlanId || store.plans.length === 0) return null;
      return store.plans.find(p => p.id === store.activePlanId) || store.plans[0] || null;
    },

    getAllPlans: function() {
      return loadStore().plans;
    },

    setActivePlan: function(planId) {
      const store = loadStore();
      const plan = store.plans.find(p => p.id === planId);
      if (plan) {
        store.activePlanId = planId;
        saveStore(store);
      }
      return plan;
    },

    createPlan: function(config) {
      const newPlan = generatePlanSchedule(config);
      if (!newPlan) return null;

      const store = loadStore();
      // If there are other active plans, set this one as active
      store.plans.push(newPlan);
      store.activePlanId = newPlan.id;
      saveStore(store);
      return newPlan;
    },

    updatePlanConfig: function(planId, newConfig) {
      const store = loadStore();
      const oldPlanIndex = store.plans.findIndex(p => p.id === planId);
      if (oldPlanIndex === -1) return null;

      const oldPlan = store.plans[oldPlanIndex];

      // Preserve completed activity IDs
      const completedActivityIds = new Set();
      oldPlan.days.forEach(d => {
        d.activities.forEach(a => {
          if (a.status === 'completed') completedActivityIds.add(a.id);
        });
      });

      // Generate freshly scheduled plan
      const updatedPlan = generatePlanSchedule({
        ...newConfig,
        name: newConfig.name || oldPlan.name
      });
      if (!updatedPlan) return null;

      updatedPlan.id = oldPlan.id;
      updatedPlan.createdAt = oldPlan.createdAt;
      updatedPlan.status = oldPlan.status;

      // Re-apply completed statuses
      let totalCompleted = 0;
      updatedPlan.days.forEach(d => {
        let allDayDone = true;
        d.activities.forEach(a => {
          if (completedActivityIds.has(a.id)) {
            a.status = 'completed';
            totalCompleted++;
          } else {
            allDayDone = false;
          }
        });
        d.completed = d.activities.length > 0 && allDayDone;
      });

      updatedPlan.completedActivities = totalCompleted;

      // Find first incomplete day
      const firstIncomplete = updatedPlan.days.find(d => !d.completed);
      updatedPlan.currentDayNumber = firstIncomplete ? firstIncomplete.dayNumber : updatedPlan.days.length;

      store.plans[oldPlanIndex] = updatedPlan;
      saveStore(store);
      return updatedPlan;
    },

    togglePausePlan: function(planId) {
      const store = loadStore();
      const plan = store.plans.find(p => p.id === planId);
      if (!plan) return null;

      if (plan.status === 'paused') {
        plan.status = 'active';
      } else if (plan.status === 'active') {
        plan.status = 'paused';
      }
      saveStore(store);
      return plan;
    },

    deletePlan: function(planId) {
      const store = loadStore();
      store.plans = store.plans.filter(p => p.id !== planId);
      if (store.activePlanId === planId) {
        store.activePlanId = store.plans.length > 0 ? store.plans[0].id : null;
      }
      saveStore(store);
      return store;
    },

    toggleActivityStatus: function(planId, dayNumber, activityId) {
      const store = loadStore();
      const plan = store.plans.find(p => p.id === planId);
      if (!plan) return null;

      const day = plan.days.find(d => d.dayNumber === dayNumber);
      if (!day) return null;

      const activity = day.activities.find(a => a.id === activityId);
      if (!activity) return null;

      const isCompleted = activity.status === 'completed';
      activity.status = isCompleted ? 'not_started' : 'completed';
      activity.completedAt = isCompleted ? null : new Date().toISOString();

      if (!isCompleted) {
        if (!store.allTimeCompletedActivities.includes(activityId)) {
          store.allTimeCompletedActivities.push(activityId);
        }
      }

      // Check if day is complete
      const allCompletedInDay = day.activities.every(a => a.status === 'completed');
      const wasDayCompleted = day.completed;
      day.completed = allCompletedInDay;

      // If day was just completed, update streak
      if (!wasDayCompleted && allCompletedInDay) {
        ProgressStore.recordStreakProgress(store);
      }

      // Recalculate total completed in plan
      let totalCompleted = 0;
      plan.days.forEach(d => {
        d.activities.forEach(a => {
          if (a.status === 'completed') totalCompleted++;
        });
      });
      plan.completedActivities = totalCompleted;

      // Check if entire plan completed
      if (plan.completedActivities >= plan.totalActivities) {
        plan.status = 'completed';
      }

      saveStore(store);
      return { plan, day, activity, dayJustCompleted: !wasDayCompleted && allCompletedInDay };
    },

    completeDay: function(planId, dayNumber) {
      const store = loadStore();
      const plan = store.plans.find(p => p.id === planId);
      if (!plan) return null;

      const day = plan.days.find(d => d.dayNumber === dayNumber);
      if (!day) return null;

      day.activities.forEach(a => {
        a.status = 'completed';
        if (!store.allTimeCompletedActivities.includes(a.id)) {
          store.allTimeCompletedActivities.push(a.id);
        }
      });
      day.completed = true;

      ProgressStore.recordStreakProgress(store);

      // Advance currentDayNumber if next day exists
      if (plan.currentDayNumber === dayNumber && dayNumber < plan.days.length) {
        plan.currentDayNumber = dayNumber + 1;
      }

      // Recalculate total completed
      let totalCompleted = 0;
      plan.days.forEach(d => {
        d.activities.forEach(a => {
          if (a.status === 'completed') totalCompleted++;
        });
      });
      plan.completedActivities = totalCompleted;

      if (plan.completedActivities >= plan.totalActivities) {
        plan.status = 'completed';
      }

      saveStore(store);
      return { plan, day };
    },

    startNextDay: function(planId) {
      const store = loadStore();
      const plan = store.plans.find(p => p.id === planId);
      if (!plan) return null;

      if (plan.currentDayNumber < plan.days.length) {
        plan.currentDayNumber += 1;
        saveStore(store);
      }
      return plan;
    },

    recordStreakProgress: function(store) {
      const todayISO = formatDateISO(new Date());
      if (store.lastCompletedDate === todayISO) {
        // Already recorded today
        return;
      }

      if (!store.lastCompletedDate) {
        store.streak = 1;
      } else {
        const lastDate = parseDateInput(store.lastCompletedDate);
        const today = parseDateInput(todayISO);
        const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          store.streak = (store.streak || 0) + 1;
        } else if (diffDays > 1) {
          store.streak = 1;
        }
      }
      store.lastCompletedDate = todayISO;
    },

    getCategoryStats: function() {
      const store = loadStore();
      const activePlan = store.plans.find(p => p.id === store.activePlanId);
      const allActivities = QL.getAllActivities();

      // Categories to track
      const categories = [
        { key: 'Foundations', label: 'Foundations', color: '#06b6d4' },
        { key: 'Quantum Gates', label: 'Quantum Gates', color: '#818cf8' },
        { key: 'Quantum Circuits', label: 'Quantum Circuits', color: '#a855f7' },
        { key: 'Quantum Algorithms', label: 'Algorithms', color: '#ec4899' },
        { key: 'Noise & Hardware', label: 'Noise & Hardware', color: '#f59e0b' }
      ];

      return categories.map(cat => {
        const catActs = allActivities.filter(a => a.category === cat.key);
        const total = catActs.length;
        let completed = 0;

        catActs.forEach(a => {
          if (store.allTimeCompletedActivities.includes(a.id)) {
            completed++;
          }
        });

        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          ...cat,
          total: total,
          completed: completed,
          percentage: pct
        };
      });
    },

    /* Calculate dynamic preview stats without saving */
    calculatePreview: function(config) {
      const plan = generatePlanSchedule(config);
      if (!plan) {
        return {
          totalActivities: 0,
          durationDays: 0,
          dailyTimeStr: `${config.dailyStudyTimeMinutes || 60} min/day`,
          startDateStr: '—',
          endDateStr: '—',
          level: 'Beginner'
        };
      }
      return {
        totalActivities: plan.totalActivities,
        durationDays: plan.durationDays,
        dailyTimeStr: plan.dailyStudyTimeMinutes >= 60
          ? `${(plan.dailyStudyTimeMinutes / 60).toFixed(plan.dailyStudyTimeMinutes % 60 === 0 ? 0 : 1)} hours/day`
          : `${plan.dailyStudyTimeMinutes} min/day`,
        startDateStr: plan.formattedStartDate,
        endDateStr: plan.formattedEndDate,
        level: plan.level
      };
    }
  };

  QL.ProgressStore = ProgressStore;
})();
