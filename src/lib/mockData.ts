export const mockData: Record<string, unknown> = {
  "/apik/login": {
    "msg": "Welcome",
    "data": { "id": "manthika" },
    "okay": true
  },
  "/apik/node/list": {
    "okay": true,
    "msg": "Success",
    "data": {
      "nodeList": [
        { "id": "prod1", "name": "Production Node 1", "desc": "Main production server", "emittable": true, "emit_count": 150, "online_status": true },
        { "id": "prod2", "name": "Production Node 2", "desc": "Backup production server", "emittable": false, "emit_count": 0, "online_status": false }
      ]
    }
  },
  "/apik/prod1/process/list": {
    "okay": true, "msg": "Success",
    "data": {
      "nodeId": "prod1",
      "processList": [
        { "data": [{ "PARAM": "1", "PPID": "1", "MEM": "13116", "NAME": "beacon", "PID": "2865332", "CPU": "0.0", "COMMAND": "./beacon 1", "APPCODE": "beacon" }], "target": "beacon" },
        { "data": [{ "PARAM": "1", "PPID": "1", "MEM": "52864", "NAME": "sweeper", "PID": "2865333", "CPU": "0.0", "COMMAND": "./vapp -n sweeper 1", "APPCODE": "sweeper" }], "target": "sweeper" },
        { "data": {}, "target": "recv" },
        { "data": [
          { "PARAM": "dist", "PPID": "1", "MEM": "22240", "NAME": "subsequent", "PID": "2865334", "CPU": "0.4", "COMMAND": "./subsequent dist", "APPCODE": "subsequent" },
          { "PARAM": "qos", "PPID": "1", "MEM": "16136", "NAME": "subsequent", "PID": "2865335", "CPU": "0.2", "COMMAND": "./subsequent qos", "APPCODE": "subsequent" }
        ], "target": "subsequent" },
        { "data": [
          { "PARAM": "recovery", "PPID": "1", "MEM": "15348", "NAME": "kqp", "PID": "2210976", "CPU": "0.0", "COMMAND": "./kqp recovery", "APPCODE": "kqp" },
          { "PARAM": "dp", "PPID": "1", "MEM": "36304", "NAME": "kqp", "PID": "2865337", "CPU": "0.0", "COMMAND": "./kqp dp", "APPCODE": "kqp" },
          { "PARAM": "1", "PPID": "1", "MEM": "174412", "NAME": "kqp", "PID": "2865338", "CPU": "0.9", "COMMAND": "./kqp 1", "APPCODE": "kqp" }
        ], "target": "kqp" }
      ]
    }
  },
  "/apik/prod1/service/status": {
    "okay": true, "msg": "Success",
    "data": {
      "nodeId": "prod1",
      "service_status": {
        "idate": 20250410, "okay": true, "date": "2025-04-10", "time": 161500,
        "log": {},
        "verify": { "master_receive": true, "cacheclear": false, "process": true, "dailyclear": true },
        "emittable": true, "wday": "Thursday",
        "audit": {
          "masters": { "distributable_issues": ["KR5701000055"], "krx_count": 10, "nxt_count": 5, "common_count": 3 },
          "process": { "beacon": { "1": { "cmd": "./beacon 1", "mem": 13116, "owner": "root", "id": "beacon", "pname": "beacon", "inst": "1", "cpur": 0.0, "pid": 2865332 } } },
          "tasks": [{ "msg": "System initialized", "date": 20250410, "time": "160000" }]
        }
      }
    }
  },
  "/apik/prod1/node/metrics/disk": {
    "okay": true, "msg": "Success",
    "data": { "disk_usage": 65, "disk_used_size": 325, "disk_total_size": 500 }
  },
  "/apik/prod1/node/metrics": {
    "okay": true, "msg": "Success",
    "data": {
      "metrics": [
        { "name": "prod1", "hhmmss": "090000", "cpu": 12, "memory": 45, "inbound_bytes": 1024, "outbound_bytes": 512, "inbound_count": 100, "outbound_count": 80 },
        { "name": "prod1", "hhmmss": "093000", "cpu": 18, "memory": 48, "inbound_bytes": 2048, "outbound_bytes": 1024, "inbound_count": 150, "outbound_count": 120 },
        { "name": "prod1", "hhmmss": "100000", "cpu": 22, "memory": 52, "inbound_bytes": 3072, "outbound_bytes": 1536, "inbound_count": 200, "outbound_count": 180 },
        { "name": "prod1", "hhmmss": "103000", "cpu": 15, "memory": 50, "inbound_bytes": 2560, "outbound_bytes": 1280, "inbound_count": 175, "outbound_count": 140 },
        { "name": "prod1", "hhmmss": "110000", "cpu": 30, "memory": 55, "inbound_bytes": 4096, "outbound_bytes": 2048, "inbound_count": 250, "outbound_count": 200 },
        { "name": "prod1", "hhmmss": "113000", "cpu": 25, "memory": 53, "inbound_bytes": 3584, "outbound_bytes": 1792, "inbound_count": 220, "outbound_count": 190 },
        { "name": "prod1", "hhmmss": "120000", "cpu": 20, "memory": 51, "inbound_bytes": 3000, "outbound_bytes": 1500, "inbound_count": 180, "outbound_count": 160 }
      ]
    }
  },
  "/apik/prod1/node/metrics/memory": {
    "okay": true, "msg": "Success",
    "data": {
      "metrics": [
        { "name": "prod1", "hhmmss": "090000", "memory": 45 },
        { "name": "prod1", "hhmmss": "100000", "memory": 52 },
        { "name": "prod1", "hhmmss": "110000", "memory": 55 },
        { "name": "prod1", "hhmmss": "120000", "memory": 51 }
      ]
    }
  },
  "/apik/prod1/channel/list": {
    "okay": true, "msg": "Success",
    "data": {
      "list": [
        { "id": 1, "name": "channel-A", "count": 1204, "port": 5001, "mip": "239.1.1.1", "nic": "eth0", "utype": "multicast", "type": "UDP", "topic": "market-data", "is_running": true },
        { "id": 2, "name": "channel-B", "count": 856, "port": 5002, "mip": "239.1.1.2", "nic": "eth0", "utype": "unicast", "type": "UDP", "topic": "order-flow", "is_running": true },
        { "id": 3, "name": "channel-C", "count": 0, "port": 5003, "mip": "239.1.1.3", "nic": "eth1", "utype": "broadcast", "type": "UDP", "topic": "heartbeat", "is_running": false }
      ]
    }
  },
  "/apik/prod1/rule/list": {
    "okay": true, "msg": "Success",
    "data": {
      "list": [
        { "name": "rule-001", "path": "/rules/001", "timestamp": "2025-04-10 09:00:00", "ref_layout": "layout-A", "ref_process": 3761797, "ref_actions": "action-001", "desc": "Main trading rule" },
        { "name": "rule-002", "path": "/rules/002", "timestamp": "2025-04-10 09:30:00", "ref_layout": "layout-B", "ref_process": 1234567, "ref_actions": "action-002", "desc": "Backup rule" }
      ]
    }
  },
  "/apik/prod1/action/list": {
    "okay": true, "msg": "Success",
    "data": {
      "list": [
        { "name": "action-001", "path": "/actions/001", "timestamp": "2025-04-10 09:00:00", "ref_layout": "layout-A", "ref_process": 1000, "desc": "Primary action" },
        { "name": "action-002", "path": "/actions/002", "timestamp": "2025-04-10 09:30:00", "ref_layout": "layout-B", "ref_process": 2000, "desc": "Secondary action" }
      ]
    }
  },
  "/apik/prod1/layout/list": {
    "okay": true, "msg": "Success",
    "data": {
      "list": [
        { "name": "layout-A", "path": "/layouts/A", "timestamp": "2025-04-10 09:00:00", "ref_process": 5000, "desc": "Primary layout" },
        { "name": "layout-B", "path": "/layouts/B", "timestamp": "2025-04-10 09:30:00", "ref_process": 6000, "desc": "Secondary layout" }
      ]
    }
  },
  "/apik/prod1/spec/list": {
    "okay": true, "msg": "Success",
    "data": {
      "list": [
        { "name": "spec-001", "version": "1.0.0", "timestamp": "2025-04-10 09:00:00", "desc": "Market data spec" },
        { "name": "spec-002", "version": "2.1.0", "timestamp": "2025-04-10 09:30:00", "desc": "Order spec" }
      ]
    }
  },
  "/apik/prod1/identify/list": {
    "okay": true, "msg": "Success",
    "data": {
      "list": [
        { "id": "ID001", "name": "Identifier A", "type": "primary", "timestamp": "2025-04-10 09:00:00", "desc": "Primary identifier" },
        { "id": "ID002", "name": "Identifier B", "type": "secondary", "timestamp": "2025-04-10 09:30:00", "desc": "Secondary identifier" }
      ]
    }
  },
  "/apik/prod1/function/list": {
    "okay": true, "msg": "Success",
    "data": {
      "list": [
        { "id": "FN001", "name": "Function A", "type": "calc", "timestamp": "2025-04-10 09:00:00", "desc": "Calculation function" },
        { "id": "FN002", "name": "Function B", "type": "filter", "timestamp": "2025-04-10 09:30:00", "desc": "Filter function" }
      ]
    }
  },
  "/apik/prod1/auditlog/list": {
    "okay": true, "msg": "Success",
    "data": {
      "auditLogList": [
        { "id": 1, "size": 204800, "date": "2025-04-10", "kind": "inbound", "fname": "audit_20250410_inbound.log", "desc": "Inbound audit log" },
        { "id": 2, "size": 102400, "date": "2025-04-10", "kind": "outbound", "fname": "audit_20250410_outbound.log", "desc": "Outbound audit log" },
        { "id": 3, "size": 51200, "date": "2025-04-09", "kind": "inbound", "fname": "audit_20250409_inbound.log", "desc": "" }
      ]
    },
    "meta": { "current_page": 1, "has_next_page": false, "has_previous_page": false, "total_pages": 1 }
  },
  "/apik/prod1/issue/list": {
    "okay": true, "msg": "Success",
    "data": {
      "nodeId": "prod1", "max_issue_count": 2847, "compet_count": 134,
      "issueList": [
        { "compet": 5, "name": "Samsung Electronics", "code": "KR005930", "seq": 1, "daily_info_dates": [20250408, 20250409, 20250410] },
        { "compet": 3, "name": "SK Hynix", "code": "KR000660", "seq": 2, "daily_info_dates": [20250408, 20250409, 20250410] },
        { "compet": 7, "name": "NAVER", "code": "KR035420", "seq": 3, "daily_info_dates": [20250408, 20250409, 20250410] },
        { "compet": 2, "name": "Kakao", "code": "KR035720", "seq": 4, "daily_info_dates": [20250408, 20250409, 20250410] },
        { "compet": 4, "name": "LG Electronics", "code": "KR066570", "seq": 5, "daily_info_dates": [20250408, 20250409, 20250410] }
      ]
    },
    "meta": { "current_page": 1, "has_next_page": true, "has_previous_page": false, "total_pages": 10 }
  }
};

export function getMockData(url: string): unknown {
  const [baseUrl] = url.split('?');
  if (url in mockData) return mockData[url];
  const matchedKey = Object.keys(mockData).find(key => key.split('?')[0] === baseUrl);
  if (matchedKey) return mockData[matchedKey];
  return null;
}
