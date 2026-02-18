import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 调试日志
console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : '未设置');
console.log('Supabase Key:', supabaseAnonKey ? '已设置' : '未设置');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 兑换码类型
export interface RedeemCode {
  id: string;
  code: string;
  count: number;
  description: string;
  maxuses: number;
  usedcount: number;
  status: 'active' | 'disabled' | 'expired';
  expiresat: string | null;
  createdat: string;
}

// 兑换记录类型
export interface RedeemUsage {
  id: string;
  codeId: string;
  code: string;
  count: number;
  userId: string;
  usedAt: string;
  description: string;
}
