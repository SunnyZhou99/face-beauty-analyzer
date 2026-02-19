// Cloudflare Worker - 代理 Vercel 网站
export default {
  async fetch(request, env, ctx) {
    try {
      // Vercel 原始地址
      const originUrl = new URL(request.url);
      const targetUrl = new URL('https://face-beauty-analyzer.vercel.app' + originUrl.pathname + originUrl.search);

      // 创建新请求
      const newRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow'
      });

      // 添加必要的头部
      newRequest.headers.set('X-Forwarded-Host', originUrl.host);
      newRequest.headers.set('X-Forwarded-Proto', originUrl.protocol.replace(':', ''));

      // 获取响应
      const response = await fetch(newRequest);

      // 复制响应头
      const newHeaders = new Headers(response.headers);
      
      // 移除可能导致问题的头部
      newHeaders.delete('content-security-policy');
      newHeaders.delete('x-frame-options');
      
      // 允许跨域
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (error) {
      return new Response(`Proxy Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
