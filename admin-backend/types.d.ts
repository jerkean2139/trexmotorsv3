declare module 'connect-pg-simple' {
  import { SessionStore } from 'express-session';
  import session from 'express-session';
  
  interface PgSessionStoreOptions {
    conString?: string;
    createTableIfMissing?: boolean;
    ttl?: number;
    tableName?: string;
  }
  
  function connectPgSimple(session: any): new (options: PgSessionStoreOptions) => SessionStore;
  
  export = connectPgSimple;
}