#!/usr/bin/env node

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const yargs = require("yargs");

const app = express();

// Parse command-line arguments
const argv = yargs
  .usage("Usage: $0 [options] <targetUrl> [proxyPort]")
  .option("H", {
    alias: "header",
    describe:
      'Add custom headers to the response (e.g., -H "HeaderName=HeaderValue")',
    type: "array",
  })
  .help("h")
  .alias("h", "help").argv;

// Get the target URL and proxy port from command-line arguments
const targetUrl = argv._[0];
const proxyPort = argv._[1] || 3000;

if (!targetUrl) {
  console.error("Please provide a target URL as the first argument.");
  process.exit(1);
}

// Define the proxy middleware
const proxyMiddleware = createProxyMiddleware({
  target: targetUrl,
  changeOrigin: true,
  onProxyRes: (proxyRes, req, res) => {
    // Add custom headers to the response
    if (argv.header) {
      argv.header.forEach((header) => {
        const [name, value] = header.split("=");
        proxyRes.headers[name] = value;
      });
    }
  },
});

// Use the proxy middleware
app.use("*", proxyMiddleware);

// Start the Express server
app.listen(proxyPort, () => {
  console.log(
    `Local proxy server is running on port ${proxyPort} and forwarding requests to ${targetUrl}`
  );
});
