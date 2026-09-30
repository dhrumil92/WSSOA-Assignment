const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Gateway is running' });
});

const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    error: (err, req, res) => {
      console.error(`Error communicating with ${target}:`, err.message);
      if (!res.headersSent) {
          res.status(503).json({
            message: 'Service Unavailable',
            error: 'The requested service is currently unreachable.'
          });
      }
    }
  }
});

app.use('/users', createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL || 'http://user-service:3001')));
app.use('/products', createProxyMiddleware(proxyOptions(process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002')));
app.use('/orders', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL || 'http://order-service:3003')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
