export const toLocalDateTimeInput = (isoDate: string) => {
    const date = new Date(isoDate);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };
  