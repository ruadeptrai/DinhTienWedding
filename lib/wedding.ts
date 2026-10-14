export type WeddingConfig = {
  groom: string; bride: string; groomFull: string; brideFull: string;
  groomFather: string; groomMother: string; brideFather: string; brideMother: string;
  date: string; ceremonyTime: string; receptionTime: string; lunarDate: string;
  ceremonyVenue: string; ceremonyAddress: string; receptionVenue: string; receptionAddress: string;
  intro: string;
};

export const defaultWedding: WeddingConfig = {
  groom: "Công Định", bride: "Thủy Tiên", groomFull: "Võ Công Định", brideFull: "Nguyễn Ngọc Thủy Tiên",
  groomFather: "Võ Công Vinh", groomMother: "Trần Thị Minh Tần",
  brideFather: "Nguyễn Hữu Duệ", brideMother: "Nguyễn Thị Kim Trâm",
  date: "2026-12-26", ceremonyTime: "09:30", receptionTime: "11:30", lunarDate: "18 tháng 11 năm Bính Ngọ",
  ceremonyVenue: "Tư gia nhà trai", ceremonyAddress: "Paris 19–26, KĐT Vinhomes Imperia, phường Hồng Bàng, TP. Hải Phòng",
  receptionVenue: "Cung Sapphire · Hải Đăng Plaza", receptionAddress: "Tòa nhà Kim Cương, số 19–35 Trần Khánh Dư, Hải Phòng",
  intro: "Sau những ngày cùng nhau đi qua, chúng mình chọn đi tiếp một hành trình — hành trình có nhau. Sự hiện diện của bạn sẽ làm ngày vui ấy trọn vẹn hơn.",
};

export type Invitation = { id: string; token: string; guestName: string; salutation: string; groupName: string; maxGuests: number; note: string; enabled: number; createdAt: string; openedAt: string | null; attendance?: string | null; guests?: number | null; wish?: string | null; respondedAt?: string | null; };
export type RSVP = { id: string; inviteId: string | null; guestName: string; attendance: "yes" | "no" | "later"; guests: number; event: "ceremony" | "reception" | "both"; wish: string; groupName: string; createdAt: string; updatedAt: string; };
export const attendanceLabels: Record<string,string> = { yes: "Sẽ tham dự", no: "Không tham dự", later: "Chưa xác nhận" };
export const eventLabels: Record<string,string> = { ceremony: "Lễ thành hôn", reception: "Tiệc mừng", both: "Cả hai chương trình" };

export class InputError extends Error { status = 400; }
export function cleanText(value: unknown, max: number, label: string, required = true): string {
  if (value === undefined || value === null) value = "";
  if (typeof value !== "string") throw new InputError(`${label} không hợp lệ.`);
  const text = value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  if (required && !text) throw new InputError(`Vui lòng nhập ${label.toLowerCase()}.`);
  if (text.length > max) throw new InputError(`${label} tối đa ${max} ký tự.`);
  return text;
}
export function validateRSVP(value: Record<string,unknown>, invite?: Pick<Invitation,"guestName"|"maxGuests"|"groupName">) {
  const guestName = invite?.guestName ?? cleanText(value.guestName, 100, "Tên khách mời");
  const attendance = cleanText(value.attendance, 10, "Xác nhận tham dự");
  if (!["yes","no","later"].includes(attendance)) throw new InputError("Vui lòng chọn tình trạng tham dự.");
  const count = Number(value.guests);
  if (attendance === "yes" && (!Number.isInteger(count) || count < 1 || count > (invite?.maxGuests ?? 10))) throw new InputError(`Số người tham dự phải từ 1 đến ${invite?.maxGuests ?? 10}.`);
  const event = cleanText(value.event, 20, "Chương trình tham dự");
  if (!["ceremony","reception","both"].includes(event)) throw new InputError("Chương trình tham dự không hợp lệ.");
  const wish = cleanText(value.wish, 1200, "Lời chúc", false);
  const submissionId = cleanText(value.submissionId, 80, "Mã phản hồi");
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(submissionId)) throw new InputError("Mã phản hồi không hợp lệ. Vui lòng tải lại trang.");
  return { guestName, attendance: attendance as RSVP["attendance"], guests: attendance === "yes" ? count : 0, event: event as RSVP["event"], wish, groupName: invite?.groupName ?? "Khách tự xác nhận", submissionId };
}
export function validateConfig(input: Record<string,unknown>): WeddingConfig {
  const result = {} as WeddingConfig;
  for (const key of Object.keys(defaultWedding) as (keyof WeddingConfig)[]) result[key] = cleanText(input[key], key === "intro" ? 1500 : 250, key, !["groomFather","groomMother","brideFather","brideMother","lunarDate"].includes(key));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.date) || Number.isNaN(Date.parse(result.date + "T00:00:00+07:00"))) throw new InputError("Ngày cưới không hợp lệ.");
  if (new Date(result.date + "T12:00:00+07:00").toISOString().slice(0,10) !== result.date) throw new InputError("Ngày cưới không tồn tại trong lịch.");
  for (const key of ["ceremonyTime","receptionTime"] as const) if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result[key])) throw new InputError("Giờ tổ chức không hợp lệ.");
  return result;
}
export function weddingDate(config: WeddingConfig) { return new Date(`${config.date}T${config.ceremonyTime}:00+07:00`); }
export function prettyDate(date: string) { return new Date(date + "T12:00:00+07:00").toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }); }
export function dayName(date: string) { return new Date(date + "T12:00:00+07:00").toLocaleDateString("vi-VN", { weekday: "long", timeZone: "Asia/Ho_Chi_Minh" }); }
