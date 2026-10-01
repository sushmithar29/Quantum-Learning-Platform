"""Add clickable official references without changing any page content.

Run only after native-export.pdf is available. The PDF artifact-operation
marker should already have been run by the parent creation workflow.
"""

from __future__ import annotations

import hashlib
from pathlib import Path
import re

import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link


BUILD = Path(__file__).resolve().parent
SOURCE = BUILD / "branded-export.pdf"
DESTINATION = BUILD.parent / "output" / "QuantumLab_SIH2026_Presentation.pdf"
REFERENCES = [
    ("IBM Quantum Composer", "https://quantum.cloud.ibm.com/docs/en/guides/composer"),
    ("Qiskit Aer", "https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html"),
    ("Google Cirq", "https://quantumai.google/cirq/simulate/simulation"),
    ("PennyLane", "https://docs.pennylane.ai/en/stable/development/guide/architecture.html"),
    ("qBraid SDK / Runtime", "https://docs.qbraid.com/sdk/user-guide/transpiler"),
    ("DST + AICTE curriculum", "https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum"),
]


def page_content_hash(page):
    content = page.get_contents()
    return hashlib.sha256(content.get_data() if content is not None else b"").hexdigest()


def external_links(page):
    found = []
    for ref in page.get("/Annots", []):
        annotation = ref.get_object()
        action = annotation.get("/A")
        if action is not None:
            action = action.get_object()
        if annotation.get("/Subtype") == "/Link" and action and action.get("/S") == "/URI":
            found.append((str(action.get("/URI")), annotation.get("/Rect")))
    return found


def main():
    if not SOURCE.is_file():
        raise FileNotFoundError(f"Native PDF export does not exist yet: {SOURCE}")

    reader = PdfReader(SOURCE)
    if len(reader.pages) < 6:
        raise ValueError("Expected reference page 6; the input has fewer than six pages")
    original_content = [page_content_hash(page) for page in reader.pages]
    original_boxes = [tuple(page.mediabox) for page in reader.pages]
    reference_page = reader.pages[5]
    if reference_page.rotation != 0:
        raise ValueError("Reference page has rotation; aborting rather than misplacing links")
    width = float(reference_page.mediabox.width)
    height = float(reference_page.mediabox.height)
    if abs(width - 960) > 1 or abs(height - 540) > 1:
        raise ValueError(f"Unexpected reference page size: {width} x {height} pt")
    if tuple(map(float, reference_page.mediabox.lower_left)) != (0.0, 0.0):
        raise ValueError("Expected a zero-origin page media box")

    rectangles = []
    with pdfplumber.open(SOURCE) as document:
        page = document.pages[5]
        for index, (label, url) in enumerate(REFERENCES):
            matches = page.search(re.escape(label), regex=True, case=True)
            if len(matches) == 1:
                hit = matches[0]
                rectangle = (
                    max(0, hit["x0"] - 2),
                    height - hit["bottom"] - 2,
                    min(width, hit["x1"] + 2),
                    height - hit["top"] + 2,
                )
                method = "text bounds"
            else:
                # Layout from build-deck.mjs, in 1280 x 720 CSS pixels:
                # table x=56, y=228; first-column width=405;
                # header height=52 and six reference rows each height=52.
                scale_x, scale_y = width / 1280, height / 720
                top = 228 + 52 + index * 52
                rectangle = (
                    (56 + 6) * scale_x,
                    height - (top + 52 - 5) * scale_y,
                    (56 + 405 - 6) * scale_x,
                    height - (top + 5) * scale_y,
                )
                method = "verified table geometry"
            rectangles.append((label, url, rectangle, method))

    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    existing_urls = {url for url, _ in external_links(writer.pages[5])}
    added = 0
    for label, url, rectangle, method in rectangles:
        if url not in existing_urls:
            writer.add_annotation(
                page_number=5,
                annotation=Link(rect=rectangle, url=url, border=[0, 0, 0]),
            )
            added += 1
        print(f"{label}: {method}; {tuple(round(n, 2) for n in rectangle)}")

    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    temporary = DESTINATION.with_name(DESTINATION.stem + ".links-tmp.pdf")
    with temporary.open("wb") as stream:
        writer.write(stream)

    result = PdfReader(temporary)
    if len(result.pages) != len(reader.pages):
        raise AssertionError("Page count changed")
    if [tuple(page.mediabox) for page in result.pages] != original_boxes:
        raise AssertionError("Page dimensions changed")
    if [page_content_hash(page) for page in result.pages] != original_content:
        raise AssertionError("Page drawing content changed")
    actual_urls = {url for url, _ in external_links(result.pages[5])}
    missing = {url for _, url in REFERENCES} - actual_urls
    if missing:
        raise AssertionError(f"Reference links missing after export: {sorted(missing)}")
    # All reading is complete before atomic replacement on Windows.
    result.close()
    reader.close()
    writer.close()
    temporary.replace(DESTINATION)
    print(f"Saved {DESTINATION}; retained all pages; added {added} reference links")


if __name__ == "__main__":
    main()
