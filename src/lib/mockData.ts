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
        {
          "data": [
            { "PARAM": "dist", "PPID": "1", "MEM": "22240", "NAME": "subsequent", "PID": "2865334", "CPU": "0.4", "COMMAND": "./subsequent dist", "APPCODE": "subsequent" },
            { "PARAM": "qos", "PPID": "1", "MEM": "16136", "NAME": "subsequent", "PID": "2865335", "CPU": "0.2", "COMMAND": "./subsequent qos", "APPCODE": "subsequent" }
          ], "target": "subsequent"
        },
        {
          "data": [
            { "PARAM": "recovery", "PPID": "1", "MEM": "15348", "NAME": "kqp", "PID": "2210976", "CPU": "0.0", "COMMAND": "./kqp recovery", "APPCODE": "kqp" },
            { "PARAM": "dp", "PPID": "1", "MEM": "36304", "NAME": "kqp", "PID": "2865337", "CPU": "0.0", "COMMAND": "./kqp dp", "APPCODE": "kqp" },
            { "PARAM": "1", "PPID": "1", "MEM": "174412", "NAME": "kqp", "PID": "2865338", "CPU": "0.9", "COMMAND": "./kqp 1", "APPCODE": "kqp" }
          ], "target": "kqp"
        }
      ]
    }
  },
  "/apik/prod1/process/beacon": {
    "okay": true, "msg": "Success",
    "data": {
      "item": {
        "name": "beacon", "timestamp": "2025-04-10 16:15:00", "cpu": "0.0", "mem": "13116", "desc": "Beacon heartbeat process",
        "layout_def": "# beacon process definition\n\n[process]\nname = beacon\ntype = daemon\nrestart = always\n\n[resource]\ncpu_limit = 10\nmem_limit = 64MB\n\n[schedule]\nstart_time = 00:00\nstop_time = 23:59\ninterval = 30s\n\n[health_check]\nendpoint = /health\ntimeout = 5s\nretries = 3"
      }
    }
  },
  "/apik/prod1/process/sweeper": {
    "okay": true, "msg": "Success",
    "data": {
      "item": {
        "name": "sweeper", "timestamp": "2025-04-10 16:15:00", "cpu": "0.0", "mem": "52864", "desc": "Data sweeper and cleanup process",
        "layout_def": "# sweeper process definition\n\n[process]\nname = sweeper\ntype = daemon\nrestart = on-failure\n\n[resource]\ncpu_limit = 20\nmem_limit = 128MB\n\n[schedule]\nstart_time = 00:00\nstop_time = 23:59\ninterval = 60s"
      }
    }
  },
  "/apik/prod1/process/subsequent": {
    "okay": true, "msg": "Success",
    "data": {
      "item": {
        "name": "subsequent", "timestamp": "2025-04-10 16:15:00", "cpu": "0.4", "mem": "22240", "desc": "Subsequent event processing",
        "layout_def": "# subsequent process definition\n\n[process]\nname = subsequent\ntype = worker\nrestart = always\ninstances = 2\n\n[params]\nmode = dist|qos\n\n[resource]\ncpu_limit = 30\nmem_limit = 256MB"
      }
    }
  },
  "/apik/prod1/process/kqp": {
    "okay": true, "msg": "Success",
    "data": {
      "item": {
        "name": "kqp", "timestamp": "2025-04-10 16:15:00", "cpu": "0.9", "mem": "174412", "desc": "KQP core processing engine",
        "layout_def": "# kqp process definition\n\n[process]\nname = kqp\ntype = worker\nrestart = always\ninstances = 3\n\n[params]\nmode = recovery|dp|main\npriority = high\n\n[resource]\ncpu_limit = 80\nmem_limit = 512MB\n\n[network]\nlisten_port = 8080\nmax_connections = 1000\n\n[logging]\nlevel = info\nrotation = daily\nmax_files = 30"
      }
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
        { "name": "spec-001", "path": "/data/spec/market", "timestamp": "2025-04-10 09:00:00", "ref_identifies": 5, "frags": 12, "size": 256, "desc": "Market data spec" },
        { "name": "spec-002", "path": "/data/spec/order", "timestamp": "2025-04-10 09:30:00", "ref_identifies": 3, "frags": 8, "size": 128, "desc": "Order spec" }
      ]
    }
  },
  "/apik/prod1/spec/spec-001": {
    "okay": true, "msg": "Success",
    "data": {
      "detail": {
        "name": "spec-001", "path": "/data/spec/market", "timestamp": "2025-04-10 09:00:00",
        "ref_identifies": 5, "frags": 12, "size": 256, "desc": "Market data spec",
        "related_identifies": [
          { "name": "KR5701000055", "ref_count": 12, "url": "/identify/KR5701000055" },
          { "name": "KR5701000063", "ref_count": 8, "url": "/identify/KR5701000063" },
          { "name": "KR7005930003", "ref_count": 45, "url": "/identify/KR7005930003" },
          { "name": "KR7000660001", "ref_count": 3, "url": "/identify/KR7000660001" },
          { "name": "KR7035720002", "ref_count": 22, "url": "/identify/KR7035720002" }
        ],
        "spec_definition": [
          { "order": 1, "offset": 0, "length": 2, "type": "string", "desc": "Data Type" },
          { "order": 2, "offset": 2, "length": 12, "type": "string", "desc": "Issue Code" },
          { "order": 3, "offset": 14, "length": 5, "type": "int", "desc": "Seq No" },
          { "order": 4, "offset": 19, "length": 9, "type": "int", "desc": "Price" },
          { "order": 5, "offset": 28, "length": 12, "type": "long", "desc": "Volume" },
          { "order": 6, "offset": 40, "length": 8, "type": "string", "desc": "Time" },
          { "order": 7, "offset": 48, "length": 1, "type": "char", "desc": "Market Status" },
          { "order": 8, "offset": 49, "length": 9, "type": "int", "desc": "Open Price" },
          { "order": 9, "offset": 58, "length": 9, "type": "int", "desc": "High Price" },
          { "order": 10, "offset": 67, "length": 9, "type": "int", "desc": "Low Price" },
          { "order": 11, "offset": 76, "length": 15, "type": "long", "desc": "Turnover" },
          { "order": 12, "offset": 91, "length": 9, "type": "int", "desc": "Prev Close" }
        ]
      }
    }
  },
  "/apik/prod1/spec/spec-002": {
    "okay": true, "msg": "Success",
    "data": {
      "detail": {
        "name": "spec-002", "path": "/data/spec/order", "timestamp": "2025-04-10 09:30:00",
        "ref_identifies": 3, "frags": 8, "size": 128, "desc": "Order spec",
        "related_identifies": [
          { "name": "KR5701000055", "ref_count": 6, "url": "/identify/KR5701000055" },
          { "name": "KR7005930003", "ref_count": 20, "url": "/identify/KR7005930003" },
          { "name": "KR7000660001", "ref_count": 14, "url": "/identify/KR7000660001" }
        ],
        "spec_definition": [
          { "order": 1, "offset": 0, "length": 2, "type": "string", "desc": "Data Type" },
          { "order": 2, "offset": 2, "length": 12, "type": "string", "desc": "Issue Code" },
          { "order": 3, "offset": 14, "length": 5, "type": "int", "desc": "Order No" },
          { "order": 4, "offset": 19, "length": 9, "type": "int", "desc": "Order Price" },
          { "order": 5, "offset": 28, "length": 12, "type": "long", "desc": "Order Qty" },
          { "order": 6, "offset": 40, "length": 1, "type": "char", "desc": "Side" },
          { "order": 7, "offset": 41, "length": 8, "type": "string", "desc": "Order Time" },
          { "order": 8, "offset": 49, "length": 5, "type": "string", "desc": "Member ID" }
        ]
      }
    }
  },
  "/apik/prod1/identify/list": {
    "okay": true, "msg": "Success",
    "data": {
      "list": [
        { "id": "ID001", "name": "KR5701000055", "path": "/data/identify/krx", "timestamp": "2025-04-10 09:00:00", "ref_specs": 3, "desc": "KRX Bond Identifier" },
        { "id": "ID002", "name": "KR7005930003", "path": "/data/identify/stock", "timestamp": "2025-04-10 09:30:00", "ref_specs": 5, "desc": "Samsung Electronics" }
      ]
    }
  },
  "/apik/prod1/identify/KR5701000055": {
    "okay": true, "msg": "Success",
    "data": {
      "item": {
        "name": "KR5701000055", "path": "/data/identify/krx", "timestamp": "2025-04-10 09:00:00",
        "ref_specs": 3, "desc": "KRX Bond Identifier",
        "keys": ["ISIN", "KRX_CODE", "SHORT_CODE"],
        "related_specs": [
          { "name": "spec-001", "ref_count": 12, "url": "/spec/spec-001" },
          { "name": "spec-002", "ref_count": 6, "url": "/spec/spec-002" }
        ],
        "spec_def": "# KR5701000055 Identifier Definition\n\n[identifier]\nname = KR5701000055\ntype = bond\nmarket = KRX\n\n[keys]\nprimary = ISIN\nsecondary = KRX_CODE\nshort = SHORT_CODE\n\n[mapping]\nISIN = KR5701000055\nKRX_CODE = 570100\nSHORT_CODE = 57010\n\n[validation]\ncheck_digit = true\nformat = ^KR[0-9]{10}$\n\n[metadata]\nissuer = Korea Treasury\ncurrency = KRW\nmaturity = 2030-06-10"
      }
    }
  },
  "/apik/prod1/identify/KR7005930003": {
    "okay": true, "msg": "Success",
    "data": {
      "item": {
        "name": "KR7005930003", "path": "/data/identify/stock", "timestamp": "2025-04-10 09:30:00",
        "ref_specs": 5, "desc": "Samsung Electronics",
        "keys": ["ISIN", "KRX_CODE", "SYMBOL", "SHORT_CODE", "ENG_NAME"],
        "related_specs": [
          { "name": "spec-001", "ref_count": 45, "url": "/spec/spec-001" },
          { "name": "spec-002", "ref_count": 20, "url": "/spec/spec-002" }
        ],
        "spec_def": "# KR7005930003 Identifier Definition\n\n[identifier]\nname = KR7005930003\ntype = equity\nmarket = KRX\n\n[keys]\nprimary = ISIN\nsecondary = KRX_CODE\nsymbol = SYMBOL\nshort = SHORT_CODE\neng = ENG_NAME\n\n[mapping]\nISIN = KR7005930003\nKRX_CODE = 005930\nSYMBOL = 005930\nSHORT_CODE = A005930\nENG_NAME = Samsung Electronics\n\n[validation]\ncheck_digit = true\nformat = ^KR[0-9]{10}$\n\n[metadata]\nsector = Electronics\ncurrency = KRW\nexchange = KOSPI\nboard_lot = 1"
      }
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

  // Handle replay info for any node
  const replayInfoMatch = baseUrl.match(/^\/apik\/([^/]+)\/replay\/info$/);
  if (replayInfoMatch) {
    return {
      okay: true,
      msg: "Success",
      data: {
        replay_status: {
          process_list: [
            { pid: "12345", command: "./replay_tool --file=inbound_log --speed=1.0" },
            { pid: "12346", command: "./replay_tool --file=outbound_log --speed=2.0" },
          ]
        },
        replay_interface: {
          log_type_list: [
            { key: "inbound", label: "Inbound" },
            { key: "outbound", label: "Outbound" },
            { key: "other", label: "Other" },
          ],
          file_tree: {
            inbound: {
              "recv_log": ["20250101", "20250115", "20250201"],
              "dist_log": ["20250110", "20250120"],
            },
            outbound: {
              "send_log": ["20250105", "20250125"],
            },
            other: {
              "misc_log": ["20250103"],
            }
          }
        }
      }
    };
  }

  if (url in mockData) return mockData[url];
  const matchedKey = Object.keys(mockData).find(key => key.split('?')[0] === baseUrl);
  if (matchedKey) return mockData[matchedKey];
  return null;
}