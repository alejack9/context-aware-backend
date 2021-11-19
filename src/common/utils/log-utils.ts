import { Logger } from '@nestjs/common';

// export const logSend = (
//   logger: Logger,
//   requestId: number,
//   i: number,
//   currentHyperparamsLength: number,
// ) =>
//   logger.log(
//     `${requestId} - Sending ${i}/${currentHyperparamsLength} (${
//       Math.round((i / currentHyperparamsLength) * 100 * 1000) / 1000
//     }%)`,
//   );

// export const logProgress = (
//   logger: Logger,
//   requestId: number,
//   progress: number,
//   promsLength: number,
// ) =>
//   logger.log(
//     `${requestId} - Receiving: ${progress} / ${promsLength} (${
//       Math.round((progress / promsLength) * 100 * 1000) / 1000
//     }%)`,
//   );

export const logSend = (
  logger: Logger,
  i: number,
  currentHyperparamsLength: number,
) =>
  logger.log(
    `Sending ${i}/${currentHyperparamsLength} (${
      Math.round((i / currentHyperparamsLength) * 100 * 1000) / 1000
    }%)`,
  );

export const logProgress = (
  logger: Logger,
  progress: number,
  promsLength: number,
) =>
  logger.log(
    `Receiving: ${progress} / ${promsLength} (${
      Math.round((progress / promsLength) * 100 * 1000) / 1000
    }%)`,
  );
