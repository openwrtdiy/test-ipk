# luci-app-turboacc

为 OpenWrt 提供图形化网络加速配置界面，支持：

- ✅ 软件流量分流（Flow Offloading）
- ✅ BBR 拥塞控制
- ✅ FullCone NAT
- ✅ 实时状态查看

适用于 OpenWrt 24.10 及以上版本。

## 安装依赖

```bash
opkg update
opkg install kmod-nft-offload kmod-tcp-bbr kmod-nft-fullcone firewall4

