import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CompletionCard } from "./CreateLoa";

describe("consultant PDF completion", () => {
  it("renders the generated PDF filename and direct signing-ready download link", () => {
    const markup = renderToStaticMarkup(
      <CompletionCard filename="Veronica_Employment_Contract.pdf" pdfUrl="https://files.example.com/loa.pdf" onAnother={() => undefined} />,
    );
    expect(markup).toContain("Your LOA is ready for signing.");
    expect(markup).toContain("Veronica_Employment_Contract.pdf is ready as a signing-ready PDF.");
    expect(markup).toContain('href="https://files.example.com/loa.pdf"');
    expect(markup).toContain("Download signing-ready PDF");
  });
});
