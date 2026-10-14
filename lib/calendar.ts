import type { WeddingConfig } from "./wedding";
const escape=(s:string)=>s.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
const utc=(date:string,time:string)=>new Date(`${date}T${time}:00+07:00`).toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
export function createCalendar(config:WeddingConfig){
 const stamp=new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
 const events=[{key:"ceremony",time:config.ceremonyTime,title:`Lễ thành hôn ${config.groom} & ${config.bride}`,address:config.ceremonyAddress},{key:"reception",time:config.receptionTime,title:`Tiệc mừng ${config.groom} & ${config.bride}`,address:`${config.receptionVenue}, ${config.receptionAddress}`}];
 return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Chung Doi//Wedding//VI",...events.flatMap(e=>["BEGIN:VEVENT",`UID:${e.key}-${config.date}@ngaychungdoi`,`DTSTAMP:${stamp}`,`DTSTART:${utc(config.date,e.time)}`,`SUMMARY:${escape(e.title)}`,`LOCATION:${escape(e.address)}`,"END:VEVENT"]),"END:VCALENDAR"].join("\r\n");
}
