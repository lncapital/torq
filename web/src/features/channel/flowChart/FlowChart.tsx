// https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app
import { useD3 } from "../../charts/useD3";
import React, { useEffect } from "react";
import { Selection } from "d3";
import FlowChartCanvas, { FlowData } from "../../charts/flowChartCanvas";
import { useAppSelector } from "../../../store/hooks";
import { selectFlowKeys } from "../channelSlice";

type FlowChart = {
  data: Array<FlowData>;
};

function FlowChart({ data }: FlowChart) {
  let flowChart: FlowChartCanvas;
  let currentSize: [number | undefined, number | undefined] = [undefined, undefined];
  let flowKey = useAppSelector(selectFlowKeys);

  // Check and update the chart size if the navigation changes the container size
  const navCheck: Function = (container: Selection<HTMLDivElement, {}, HTMLElement, any>): Function => {
    return () => {
      let boundingBox = container?.node()?.getBoundingClientRect();
      if (currentSize[0] !== boundingBox?.width || currentSize[1] !== boundingBox?.height) {
        flowChart.resizeChart();
        flowChart.draw();
        currentSize = [boundingBox?.width, boundingBox?.height];
      }
    };
  };

  const ref = useD3(
    (container: Selection<HTMLDivElement, {}, HTMLElement, any>) => {
      let keyOut = (flowKey.value + "_out") as keyof Omit<FlowData, "alias" | "chan_id" | "pub_key" | "channel_point">;
      let keyIn = (flowKey.value + "_in") as keyof Omit<FlowData, "alias" | "chan_id" | "pub_key" | "channel_point">;
      flowChart = new FlowChartCanvas(container, data, { keyOut: keyOut, keyIn: keyIn });
      flowChart.draw();
      setInterval(navCheck(container), 200);
    },
    [data, flowKey]
  );

  useEffect(() => {
    return () => {
      if (flowChart) {
        flowChart.removeResizeListener();
      }
    };
  }, [data, flowKey]);

  // @ts-ignore
  return <div ref={ref} />;
}

export default FlowChart;
