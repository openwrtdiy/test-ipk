# 🌌 WarpEngine (Ultra Edition)  
> **专为 nftables/fw4 架构打造的 OpenWrt 全栈网络高速转发引擎**

`WarpEngine` 是专为 **OpenWrt 24.10+**（基于 `firewall4` / `nftables`）深度定制的网络加速方案。通过重构流量转发路径，整合底层硬件分载（PPE）、全栈流量优化与智能调度算法，为现代千兆/万兆光纤网络提供近乎零损耗的转发体验。

---

## ✨ 核心特性（2025 旗舰版）

- **⚡ 双栈硬件分载（HW Flow Offload）**  
  支持 IPv4/IPv6 流量直通硬件（如 MediaTek PPE、Rockchip 等），显著降低 CPU 占用。
- **🎮 游戏战斗模式（CAKE QoS）**  
  集成内核级 `CAKE` 队列管理算法，优先处理小包流量，抑制游戏延迟抖动。
- **🌐 IPv6 全栈加速**  
  完美适配 OpenWrt 24.10 的 IPv6 分载机制，实现双栈无差别高速转发。
- **🛠️ MSS 自动钳制**  
  智能修复 PPPoE 场景 MTU 问题，解决网页加载慢、图片打不开等故障。
- **🎯 智能 DNS 导航**  
  自动测速并切换至最低延迟公共 DNS（如 1.1.1.1、8.8.8.8、223.5.5.5）。
- **🛡️ 加速排除名单**  
  按 IP 豁免关键设备（NAS、VPN 等），避免分载导致异常。
- **📈 实时状态监控**  
  WebUI 实时展示活跃流、PPE 状态与 TCP 拥塞算法。

---

## 🚀 运行状态说明

在控制面板中监控：
- **Active Flows > 0**：流量已进入“曲速路径”。
- **PPE Status = Active**：硬件加速生效，CPU 负载最低。
- **TCP Algorithm = bbr**：BBR 拥塞控制已启用。

---

## ⚠️ 注意事项（必读）

1. **仅支持 OpenWrt 24.10+**（`fw4`/`nftables` 架构）。
2. **禁止使用 `iptables` 手动规则**，会破坏加速逻辑。
3. **FullCone NAT** 需 `kmod-nft-fullcone`；**硬件加速**需 SoC 支持（如 MT798x/MT7621）。

---

## 🚫 已知冲突与解决方案

| 冲突项 | 问题 | 解决方案 |
|-------|------|--------|
| SQM QoS | 限速失效 | 关闭硬件加速，仅用软件分载 |
| 应用过滤 (OAF) | 过滤不全 | 将目标 IP 加入排除名单 |
| PassWall / SSRPlus | 规则冲突 | 在代理插件中禁用其“Shortcut-FE”或“分载”功能 |
| mwan3 多线负载 | 出口策略失衡 | 启用“多线兼容模式”或调整 nftables 优先级 |

---

## 📊 监控与调试技巧

### 查看活跃加速流
nft list chain inet fw4 warpengine_flows
或通过 WebUI 实时面板观察 “Active Flows” 计数。

### 确认 PPE 是否激活
dmesg | grep -i ppe
# 或（若驱动支持）
cat /proc/ppe/enable

### 验证 TCP BBR 是否生效
sysctl net.ipv4.tcp_congestion_control
# 应返回 bbr 或 bbr2

### 测试 MSS 钳制效果
ping -M do -s 1472 8.8.8.8
# 在 PPPoE 环境下通常需 ≤1452 才能成功

## 🔮 未来展望（2026 预研方向）
eBPF 深度集成：利用 eBPF 实现更灵活的流量调度与可观测性。
Wi-Fi 7 协同加速：结合 TWT 与 MLO，实现有线-无线统一低延迟调度。
AI 驱动的 QoS：基于实时应用识别动态调整 CAKE 参数。

## 开发环境要求
OpenWrt SDK 24.10+
支持 nftables 的测试设备（如 MT7981 开发板）

## 📥 安装说明
1. 添加软件源
将本仓库地址加入你的 feeds.conf.default，然后更新并安装：
./scripts/feeds update -a && ./scripts/feeds install -a

2. 编译勾选
在 make menuconfig 中按路径寻找：
Network -> warpengine (核心引擎)
LuCI -> 3. Applications -> luci-app-warpengine (控制界面)

3. 手动安装 (.ipk)
若使用现成的安装包，请按以下顺序安装：
opkg update
opkg install kmod-nft-offload kmod-nft-fullcone kmod-tcp-bbr tc-tiny kmod-sched-cake
opkg install warpengine_*.ipk
opkg install luci-app-warpengine_*.ipk

## 📈 状态监测
在 LuCI 界面中，您可以实时查看到 “当前加速连接数”：
连接数 > 0：说明加速引擎正在正常转发流量。
硬件 PPE 状态为 Active：说明流量已成功移交给硬件芯片，CPU 正处于空闲状态。
