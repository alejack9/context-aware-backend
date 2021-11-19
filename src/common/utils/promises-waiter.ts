type callBackFn = (current: number, total: number) => void;

export default async function waitForPromises(
  cb: callBackFn,
  proms: Promise<any>[],
) {
  let progress = 0;
  proms.forEach((p) => p.then(() => cb(++progress, proms.length)));
  await Promise.all(proms);
}
