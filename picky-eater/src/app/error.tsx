"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";

/** Catches unexpected crashes on any page, so users never see a blank screen. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pt-8">
      <title>Something went wrong · Picky Eater</title>
      <h1 className="sr-only">Something went wrong</h1>
      <EmptyState
        title="Oops, something went wrong"
        tone="problem"
        autoFocus
        actions={
          <>
            <Button onClick={() => retry()} className="w-full">
              Try again
            </Button>
            <ButtonLink href="/" variant="secondary" className="w-full">
              Go to the start
            </ButtonLink>
          </>
        }
      >
        <p>Your preferences are safe. Please try again.</p>
      </EmptyState>
    </div>
  );
}
