import { generateId } from "@/utils/generateId";
import { useEffect, useState } from "react";

// Updates the height of a <textarea> when the value changes.
const useAutosizedTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: any[],
  disable?: boolean
) => {
  function update() {
    if (textAreaRef && !disable) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.style.height = "auto";
      const scrollHeight = textAreaRef.scrollHeight;

      console.log(scrollHeight);

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = scrollHeight + "px";
    } else {
      console.log('Text area null.');
    }
  }

  useEffect(update, [ textAreaRef, ...value ]);
  return {
    update
  }
};

export default useAutosizedTextArea;