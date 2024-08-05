/**
 *  Time normalization
 *
 *  Berguna untuk mendapatkan penambahan waktu karena exceljs
 *  atau excel tidak bisa mengubah waktu UTC ke waktu pengguna berada.
 */
export function excelNormalizeTime(timeToNormalize: Date) {
  const currTime = new Date();

  const offsetInHour = currTime.getHours() - currTime.getUTCHours();
  const offsetInMinute = currTime.getMinutes() - currTime.getUTCMinutes();

  return new Date(
    timeToNormalize.getTime() +
      offsetInHour * 60 * 60 * 1000 +
      offsetInMinute * 60 * 1000,
  );
}
