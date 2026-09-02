import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const invalidate = vi.fn();
const setLocation = vi.fn();

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("wouter", () => ({ useLocation: () => ["/create", setLocation] }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ workspace: { overview: { invalidate } } }),
    workspace: {
      overview: {
        useQuery: () => ({
          isLoading: false,
          data: {
            projects: [{ id: "project-1", name: "Project One", code: "P1" }],
            templates: [{ id: "template-1", projectId: "project-1", name: "Employment LOA" }],
            templateVersions: [{ id: "version-1", templateId: "template-1", version: "1.0", status: "approved" }],
          },
        }),
      },
    },
    loas: {
      createDraft: { useMutation: () => ({ isPending: false, mutateAsync: vi.fn() }) },
      confirmReview: { useMutation: () => ({ isPending: false, mutateAsync: vi.fn() }) },
      generate: { useMutation: () => ({ isPending: false, mutateAsync: vi.fn() }) },
    },
  },
}));

import CreateLoa from "./CreateLoa";

describe("real consultant LOA form", () => {
  beforeEach(() => { invalidate.mockReset(); setLocation.mockReset(); });

  it("renders exactly the requested fields plus approved template selection and editable title", () => {
    const markup = renderToStaticMarkup(<CreateLoa />);
    const requestedLabels = ["Date", "Employee Full Name", "Employee Email", "NRIC", "Phone Number", "Job Title", "Salary Type", "Salary Amount", "Start Date", "Contract", "Period of Employment", "Payment Date", "Remarks", "Consultant Full Name", "Consultant Email"];
    for (const label of requestedLabels) expect(markup).toContain(label);
    expect(markup.match(/<(?:input|select|textarea)\b/g)?.length).toBeGreaterThanOrEqual(17);
    expect(markup).toContain("Choose approved LOA template");
    expect(markup).toContain("Employee_Employment Contract_Date_Time");
    expect(markup).not.toContain("Reference number");
    expect(markup).not.toContain("Project code");
  });
});
