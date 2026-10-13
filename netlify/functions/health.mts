import type { Config } from "@netlify/functions";

export default async () => {
  return Response.json(
    { status: "ok" },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const config: Config = {
  path: "/api/health",
};
