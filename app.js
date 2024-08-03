const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { netstat } = require('node-os-utils');
const { networkInterfaces } = require('os');

const app = express();
const port = 3000;

// Helper function to get disk space in GB
function getDiskSpace() {
  const diskInfo = {
    totalGB: '0 GB',
    freeGB: '0 GB',
    usedGB: '0 GB',
  };

  try {
    const stats = fs.statSync('/'); // For Unix-based systems
    const totalBytes = stats.blksize * stats.blocks;
    const freeBytes = stats.blksize * stats.bfree;
    const usedBytes = totalBytes - freeBytes;

    // Convert bytes to GB
    diskInfo.totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    diskInfo.freeGB = (freeBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    diskInfo.usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  } catch (err) {
    console.error('Error fetching disk space:', err);
  }

  return diskInfo;
}

// Helper function to convert bytes to GB
function bytesToGB(bytes) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// Helper function to convert bytes to TB
function bytesToTB(bytes) {
  return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(4) + ' TB';
}

// Helper function to get CPU usage
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  const idle = (totalIdle / cpus.length / totalTick * 100).toFixed(2) + '%';
  const total = (totalTick / cpus.length / 100).toFixed(2);

  return {
    idle: idle,
    total: total,
  };
}

// Helper function to get network interfaces
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const result = {};

  for (const [name, nets] of Object.entries(interfaces)) {
    result[name] = nets.map(net => ({
      address: net.address,
      family: net.family,
      mac: net.mac,
      internal: net.internal,
    }));
  }

  return result;
}

// Helper function to get network bandwidth usage
async function getNetworkBandwidth() {
  const bandwidth = await netstat.inOut();
  return {
    bytesReceived: bytesToTB(bandwidth.in),
    bytesSent: bytesToTB(bandwidth.out),
  };
}

// Endpoint to get server statistics
app.get('/', async (req, res) => {
  try {
    const stats = {
      memory: {
        totalGB: bytesToGB(os.totalmem()),
        freeGB: bytesToGB(os.freemem()),
      },
      disk: getDiskSpace(),
      uptime: (os.uptime() / 3600).toFixed(2) + ' hours', // Convert seconds to hours
      cpu: getCpuUsage(),
      network: getNetworkInterfaces(),
      bandwidth: await getNetworkBandwidth(),
      loadAverage: {
        '1min': os.loadavg()[0].toFixed(2),
        '5min': os.loadavg()[1].toFixed(2),
        '15min': os.loadavg()[2].toFixed(2),
      },
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
