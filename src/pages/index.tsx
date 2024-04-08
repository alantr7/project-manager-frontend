import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from "@/contexts/ProjectsContext";
import NoWorkspaces from "@/components/NoWorkspaces";
import {useRouter} from "next/router";
import {useLocal} from "@/hooks/useLocal";

export default function Home(props: any) {
  const app = useContext(AppContext);
  const router = useRouter();
  const [ previousWorkspace ] = useLocal('latestWorkspace', null);

  useEffect(() => {
      if (app.workspaces.length) {
          const workspace = previousWorkspace !== null && app.workspaces.find(w => w.weak_id === previousWorkspace)
              ? previousWorkspace : app.workspaces[0].weak_id;
          router.push(`/w/${workspace}/board`);
      }
  });

  return (
    <>
      {app.workspaces.length === 0 && <NoWorkspaces />}
    </>
  )
}