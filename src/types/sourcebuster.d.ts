declare module "sourcebuster" {
  interface SbjsMain {
    typ: string;
    src: string;
    mdm: string;
    cmp: string;
    cnt: string;
    trm: string;
  }
  interface SbjsExtra {
    fd: string;
    ep: string;
    rf: string;
  }
  interface SbjsSession {
    pgs: number;
    cpg: string;
  }
  interface SbjsUdata {
    vst: number;
    uip: string;
    uag: string;
  }
  interface SbjsGet {
    current: SbjsMain;
    current_add: SbjsExtra;
    first: SbjsMain;
    first_add: SbjsExtra;
    session: SbjsSession;
    udata: SbjsUdata;
  }
  interface Sbjs {
    init(opts: {
      lifetime?: number;
      session_length?: number;
      timezone_offset?: string;
      base64?: boolean;
      callback?: (get: SbjsGet) => void;
    }): void;
    get: SbjsGet;
  }
  const sbjs: Sbjs;
  export default sbjs;
}
