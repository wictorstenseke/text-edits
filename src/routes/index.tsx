import { createFileRoute } from "@tanstack/react-router";

import { DocumentEditor } from "@/pages/DocumentEditor";

export const Route = createFileRoute("/")({
  component: DocumentEditor,
});

