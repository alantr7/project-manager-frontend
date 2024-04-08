import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from "@/contexts/ProjectsContext";
import NoWorkspaces from "@/components/NoWorkspaces";
import {useRouter} from "next/router";

export default function Home(props: any) {
  const app = useContext(AppContext);
  const router = useRouter();

  

  useEffect(() => {
      if (app.workspaces.length) {
          router.push(`/w/${app.workspaces[0].weak_id}/board`);
      }
  });

  return (
    <>
      {app.workspaces.length === 0 && <NoWorkspaces />}
    </>
  )
}