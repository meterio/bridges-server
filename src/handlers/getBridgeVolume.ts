import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getDailyBridgeVolume, getHourlyBridgeVolume } from "../utils/bridgeVolume";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { secondsInDay, getCurrentUnixTimestamp } from "../utils/date";

const getBridgeVolume = async (chain?: string, bridgeNetworkId?: string) => {
  const queryChain = chain === "all" ? undefined : chain;
  const queryId = bridgeNetworkId ? parseInt(bridgeNetworkId) : undefined;
  if (bridgeNetworkId && queryId) {
    try {
      const bridgeNetwork = importBridgeNetwork(undefined, queryId);
      if (!bridgeNetwork) {
        if (!bridgeNetwork) {
          throw new Error("No bridge network found.");
        }
      }
    } catch (e) {
      return errorResponse({
        message: "Invalid bridgeNetworkId entered.",
      });
    }
  }
  const dailyVolumes = await getDailyBridgeVolume(undefined, undefined, queryChain, queryId);

  let currentDayEntry = null as unknown;
  const lastDailyTs = parseInt(dailyVolumes?.[dailyVolumes.length - 1]?.date) || 9999999999;
  const currentTimestamp = getCurrentUnixTimestamp();
  const hourlyStartTimestamp = currentTimestamp - secondsInDay;
  const lastDayHourlyVolume = await getHourlyBridgeVolume(hourlyStartTimestamp, currentTimestamp, queryChain, queryId);
  if (lastDayHourlyVolume?.length) {
    let currentDayDepositUSD = 0;
    let currentDayWithdrawUSD = 0;
    let currentDayDepositTxs = 0;
    let currentDayWithdrawTxs = 0;
    lastDayHourlyVolume.map((entry) => {
      const { date, depositTxs, withdrawTxs, depositUSD, withdrawUSD } = entry;
      // lastDailyTs is timestamp at 00:00 UTC of *previous* day
      if (parseInt(date) > lastDailyTs + secondsInDay) {
        currentDayDepositUSD += depositUSD;
        currentDayWithdrawUSD += withdrawUSD;
        currentDayDepositTxs += depositTxs;
        currentDayWithdrawTxs += withdrawTxs;
      }
    });
    currentDayEntry = {
      date: (lastDailyTs + secondsInDay).toString(),
      depositUSD: currentDayDepositUSD,
      withdrawUSD: currentDayWithdrawUSD,
      depositTxs: currentDayDepositTxs,
      withdrawTxs: currentDayWithdrawTxs,
    };
  }

  let response = dailyVolumes;
  if (currentDayEntry) {
    response.push(currentDayEntry);
  }

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase();
  const bridgeNetworkId = event.queryStringParameters?.id;
  const response = await getBridgeVolume(chain, bridgeNetworkId);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
