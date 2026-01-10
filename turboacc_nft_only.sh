#!/usr/bin/env bash
# shellcheck disable=SC2016

# ==================================================
# integrate_turboacc.sh — TurboACC nftables-only 集成脚本
# Version: v1.1.0
# Date: 2026-01-10
# Author: Based on mufeng05/turboacc + fullcone-nat-nftables
# License: GPL-3.0-only
# ==================================================

set -euo pipefail

# 清理临时目录
trap 'rm -rf "$TMPDIR"' EXIT
TMPDIR=$(mktemp -d) || { echo "Failed to create temp dir"; exit 1; }

# 检查是否在 OpenWrt 源码根目录
if [[ ! -d "./package" ]]; then
    echo "❌ Error: './package' not found. Run this script in the OpenWrt source root."
    exit 1
fi

echo "🚀 Integrating TurboACC (nftables-only mode) — v2.1.0"

# 1. 检测内核版本（仅支持 6.6 和 6.12）
kernel_versions=""
if [[ -d "./include" ]]; then
    kernel_versions=$(find "./include" -maxdepth 1 -type d -name "kernel-*" -exec basename {} \; | sed 's/kernel-//' | tr '\n' ' ')
fi
if [[ -z "$kernel_versions" && -d "./target/linux/generic" ]]; then
    kernel_versions=$(find "./target/linux/generic" -maxdepth 1 -type d -name "hack-*" -exec basename {} \; | sed 's/hack-//' | tr '\n' ' ')
fi
if [[ -z "$kernel_versions" ]]; then
    echo "❌ Error: Unable to detect kernel version."
    exit 1
fi

supported=false
for kv in $kernel_versions; do
    if [[ "$kv" == "6.6" || "$kv" == "6.12" ]]; then
        supported=true
        break
    fi
done
if [[ "$supported" == false ]]; then
    echo "❌ Only kernel 6.6 and 6.12 are supported. Detected: $kernel_versions"
    exit 1
fi
echo "✅ Detected kernel version(s): $kernel_versions"

# 2. 克隆 turboacc 仓库
echo "📥 Cloning turboacc repository..."
git clone --depth=1 --single-branch https://github.com/mufeng05/turboacc "$TMPDIR/turboacc" || { echo "Git clone failed"; exit 1; }

# 3. 创建必要目录
mkdir -p "./package/turboacc"
mkdir -p "./package/network/config/firewall4/patches"
mkdir -p "./package/network/utils/nftables/patches"
mkdir -p "./package/libs/libnftnl/patches"

# 4. 应用内核补丁（仅 6.6 / 6.12）
echo "🔧 Applying kernel patches for nftables-only mode..."
for kv in $kernel_versions; do
    if [[ "$kv" == "6.6" || "$kv" == "6.12" ]]; then
        cp -f "$TMPDIR/turboacc/lede/hack-$kv/952-add-net-conntrack-events-support-multiple-registrant.patch" "./target/linux/generic/hack-$kv/"
        cp -f "$TMPDIR/turboacc/lede/hack-$kv/953-net-patch-linux-kernel-to-support-shortcut-fe.patch" "./target/linux/generic/hack-$kv/"
        cp -f "$TMPDIR/turboacc/lede/hack-$kv/983-add-bcm-fullconenat-to-nft.patch" "./target/linux/generic/hack-$kv/"
        cp -f "$TMPDIR/turboacc/lede/pending-$kv/613-netfilter_optional_tcp_window_check.patch" "./target/linux/generic/pending-$kv/"

        # 确保 CONFIG_SHORTCUT_FE 存在
        config_file="./target/linux/generic/config-$kv"
        if ! grep -q "CONFIG_SHORTCUT_FE" "$config_file" 2>/dev/null; then
            echo "# CONFIG_SHORTCUT_FE is not set" >> "$config_file"
        fi
    fi
done

# 5. 复制 shortcut-fe
cp -rf "$TMPDIR/turboacc/lede/shortcut-fe" "./package/turboacc/"

# 6. 【关键】替换 fullconenat-nft → 官方 nft-fullcone
echo "📦 Replacing fullconenat-nft with official nft-fullcone..."
rm -rf "./package/turboacc/fullconenat-nft"
mkdir -p "./package/turboacc/nft-fullcone"
cat > "./package/turboacc/nft-fullcone/Makefile" << 'EOF'
# SPDX-License-Identifier: GPL-2.0-only
include $(TOPDIR)/rules.mk

PKG_NAME:=nft-fullcone
PKG_VERSION:=2023.05.17
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/fullcone-nat-nftables/nft-fullcone.git
PKG_SOURCE_VERSION:=07d93b626ce5ea885cd16f9ab07fac3213c355d9
PKG_MIRROR_HASH:=dde32ad6d6fd5065e50812807bd9195f3a65f31f5dc223708815d57d12570a73

PKG_MAINTAINER:=Syrone Wong <wong.syrone@gmail.com>

include $(INCLUDE_DIR)/kernel.mk
include $(INCLUDE_DIR)/package.mk

define KernelPackage/nft-fullcone
  SUBMENU:=Netfilter Extensions
  DEPENDS:=+kmod-nft-nat
  TITLE:=Netfilter nf_tables fullcone support
  FILES:=$(PKG_BUILD_DIR)/src/nft_fullcone.ko
  KCONFIG:= \
    CONFIG_NF_CONNTRACK_EVENTS=y \
    CONFIG_NF_CONNTRACK_CHAIN_EVENTS=y
  AUTOLOAD:=$(call AutoProbe,nft_fullcone)
endef

define KernelPackage/nft-fullcone/Description
  nftables fullcone expression kernel module (single-module build for Linux 6.6+)
endef

define Build/Prepare
    $(call Build/Prepare/Default)
    $(SED) 's/, const struct nft_data \*\*data//g' $(PKG_BUILD_DIR)/src/nft_ext_fullcone.c
endef

define Build/Compile
    +$(KERNEL_MAKE) M="$(PKG_BUILD_DIR)/src" modules
endef

$(eval $(call KernelPackage,nft-fullcone))
EOF

# 7. 应用 firewall4 / nftables / libnftnl 补丁
cp -f "$TMPDIR/turboacc/lede/patches/firewall4/patches/"* "./package/network/config/firewall4/patches/" 2>/dev/null || true
cp -f "$TMPDIR/turboacc/lede/patches/nftables/patches/"* "./package/network/utils/nftables/patches/" 2>/dev/null || true
cp -f "$TMPDIR/turboacc/lede/patches/libnftnl/patches/"* "./package/libs/libnftnl/patches/" 2>/dev/null || true

# 8. 写入 luci-app-turboacc（nftables-only 版本）
echo "📝 Generating luci-app-turboacc (nftables-only)..."
mkdir -p "./package/turboacc/luci-app-turboacc"
cat > "./package/turboacc/luci-app-turboacc/Makefile" << 'EOF'
# SPDX-Identifier-License: GPL-3.0-only
#
# Copyright (C) 2024 Lean <coolsnowwolf@gmail.com>
# Copyright (C) 2019-2022 ImmortalWrt.org

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-turboacc

PKG_CONFIG_DEPENDS:= \
    CONFIG_PACKAGE_TURBOACC_INCLUDE_NO_FASTPATH \
    CONFIG_PACKAGE_TURBOACC_INCLUDE_FLOW_OFFLOADING \
    CONFIG_PACKAGE_TURBOACC_INCLUDE_FAST_CLASSIFIER \
    CONFIG_PACKAGE_TURBOACC_INCLUDE_SHORTCUT_FE_CM \
    CONFIG_PACKAGE_TURBOACC_INCLUDE_BBR_CCA \
    CONFIG_PACKAGE_TURBOACC_INCLUDE_FULLCONE

PKG_LICENSE:=GPL-3.0-only
PKG_MAINTAINER:=Tianling Shen <cnsztl@immortalwrt.org>

LUCI_TITLE:=LuCI support for FastPath (nftables-only)
LUCI_DEPENDS:= \
    +PACKAGE_TURBOACC_INCLUDE_FLOW_OFFLOADING:kmod-nft-offload \
    +PACKAGE_TURBOACC_INCLUDE_FAST_CLASSIFIER:kmod-fast-classifier \
    +PACKAGE_TURBOACC_INCLUDE_SHORTCUT_FE_CM:kmod-shortcut-fe-cm \
    +PACKAGE_TURBOACC_INCLUDE_BBR_CCA:kmod-tcp-bbr \
    +PACKAGE_TURBOACC_INCLUDE_FULLCONE:kmod-nft-fullcone
LUCI_PKGARCH:=all

define Package/luci-app-turboacc/config
  choice
    prompt "FastPath Engine"
    default PACKAGE_TURBOACC_INCLUDE_FLOW_OFFLOADING if !(TARGET_qualcommax)

    config PACKAGE_TURBOACC_INCLUDE_NO_FASTPATH
    bool "Disable" if (TARGET_qualcommax)

    config PACKAGE_TURBOACC_INCLUDE_FLOW_OFFLOADING
    bool "Use flow offloading"

    config PACKAGE_TURBOACC_INCLUDE_FAST_CLASSIFIER
    bool "Use fast classifier"

    config PACKAGE_TURBOACC_INCLUDE_SHORTCUT_FE_CM
    bool "Use shortcut-fe connection manager"
  endchoice

  config PACKAGE_TURBOACC_INCLUDE_BBR_CCA
    bool "Enable BBR CCA"
    default y

  config PACKAGE_TURBOACC_INCLUDE_FULLCONE
    bool "Include fullcone NAT"
    default y
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
EOF

# 9. 复制 LuCI 前端文件（luasrc, root, po）
if [[ -d "$TMPDIR/turboacc/lede/luci-app-turboacc/luasrc" ]]; then
    cp -rf "$TMPDIR/turboacc/lede/luci-app-turboacc/luasrc" "./package/turboacc/luci-app-turboacc/"
fi
if [[ -d "$TMPDIR/turboacc/lede/luci-app-turboacc/root" ]]; then
    cp -rf "$TMPDIR/turboacc/lede/luci-app-turboacc/root" "./package/turboacc/luci-app-turboacc/"
fi
if [[ -d "$TMPDIR/turboacc/lede/luci-app-turboacc/po" ]]; then
    cp -rf "$TMPDIR/turboacc/lede/luci-app-turboacc/po" "./package/turboacc/luci-app-turboacc/"
fi

# 10. 应用自定义文件（如有）
echo "🛠️  Applying optional custom files..."

# 自定义内核 patch（可选）
for kv in $kernel_versions; do
    custom_patch="$TMPDIR/turboacc/custom/hack-$kv/951-disable-unused-functions.patch"
    if [[ -f "$custom_patch" ]]; then
        cp -f "$custom_patch" "./target/linux/generic/hack-$kv/"
    fi
done

# 自定义 LuCI 配置
custom_dir="$TMPDIR/turboacc/custom/luci-app-turboacc"
if [[ -f "$custom_dir/root/etc/uci-defaults/turboacc" ]]; then
    mkdir -p "./package/turboacc/luci-app-turboacc/root/etc/uci-defaults"
    cp -f "$custom_dir/root/etc/uci-defaults/turboacc" "./package/turboacc/luci-app-turboacc/root/etc/uci-defaults/"
fi
if [[ -f "$custom_dir/root/usr/share/rpcd/ucode/luci.turboacc" ]]; then
    mkdir -p "./package/turboacc/luci-app-turboacc/root/usr/share/rpcd/ucode"
    cp -f "$custom_dir/root/usr/share/rpcd/ucode/luci.turboacc" "./package/turboacc/luci-app-turboacc/root/usr/share/rpcd/ucode/"
fi
if [[ -f "$custom_dir/root/usr/share/ucitrack/luci-app-turboacc.json" ]]; then
    mkdir -p "./package/turboacc/luci-app-turboacc/root/usr/share/ucitrack"
    cp -f "$custom_dir/root/usr/share/ucitrack/luci-app-turboacc.json" "./package/turboacc/luci-app-turboacc/root/usr/share/ucitrack/"
fi

# 移除旧 libexec（兼容 LuCI ucode）
rm -rf "./package/turboacc/luci-app-turboacc/root/usr/libexec"

# shortcut-fe 构建修复（可选）
if [[ -f "$TMPDIR/turboacc/custom/shortcut-fe/fast-classifier/patches/001-fix-build.patch" ]]; then
    mkdir -p "./package/turboacc/shortcut-fe/fast-classifier/patches"
    cp -f "$TMPDIR/turboacc/custom/shortcut-fe/fast-classifier/patches/001-fix-build.patch" "./package/turboacc/shortcut-fe/fast-classifier/patches/"
fi

# 11. 完成提示
echo ""
echo "✅ TurboACC integration complete (v2.1.0, nftables-only mode)"
echo ""
echo "📌 Next steps:"
echo "   1. Run 'make menuconfig'"
echo "   2. Enable:"
echo "        Network → firewall4"
echo "        Kernel modules → Netfilter Extensions → kmod-nft-fullcone"
echo "        LuCI → Applications → luci-app-turboacc"
echo "   3. Build as usual"
echo ""
exit 0
