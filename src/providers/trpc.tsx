import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

export type RouterOutputs = {
  user: {
    list: Array<{
      id: number; name: string; email: string | null; role: string;
      subjectId: number | null; isActive: boolean; avatar: string | null;
      createdAt: Date; updatedAt: Date;
    }>;
  };
  subject: {
    list: Array<{ id: number; name: string; nameEn: string | null; coordinatorId: number | null; createdAt: Date }>;
  };
  teacher: {
    list: Array<{ id: number; name: string; email: string | null; subjectId: number; isCoordinator: boolean; createdAt: Date }>;
  };
  visit: {
    list: Array<{
      id: number; visitorId: number; visitorName: string; visitorRole: string;
      teacherId: number; teacherName: string; subjectId: number; subjectName: string;
      coordinatorId: number | null; coordinatorName: string | null;
      className: string; visitDate: string; visitTime: string;
      scoreObjectives: string; scoreStudentEngagement: string; scoreDiscipline: string;
      scoreTeacherEngagement: string; scoreEnvironment: string; scoreTotal: string;
      notes: string | null; strengths: string | null; improvements: string | null;
      recommendations: string | null; createdAt: Date;
    }>;
  };
  notification: {
    list: Array<{
      id: number; title: string; message: string; type: string;
      visitId: number | null; targetRoles: unknown; targetSubjectId: number | null;
      triggeredBy: string | null; isRead: boolean; createdAt: Date;
    }>;
  };
};

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
