import { useEffect, useState } from "react";

export default function EllipsisLoader() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev =>
        prev.length >= 3 ? "" : prev + "."
      );
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return <span style={{ display: "inline-block", textAlign: "left", width: "1ch"}}>{dots}</span>;
}