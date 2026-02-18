// Cloudflare Worker - 代理 Vercel 网站
export default {
  async fetch(request, env, ctx) {
    // Vercel 原始地址
    const originUrl = new URL(request.url);
    const targetUrl = 'https://face-beauty-analyzer.vercel.app' + originUrl.pathname + originUrl.search;

    // 创建新请求
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual'
    });

    // 获取响应
    const response = await fetch(newRequest);

    // 复制响应头（允许跨域）
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
