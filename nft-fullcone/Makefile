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
  FILES:= $(PKG_BUILD_DIR)/src/nft_fullcone.ko
  KCONFIG:= \
    CONFIG_NF_CONNTRACK_EVENTS=y \
    CONFIG_NF_CONNTRACK_CHAIN_EVENTS=y
  AUTOLOAD:=$(call AutoProbe,nft_fullcone)
endef

define KernelPackage/nft-fullcone/Description
  nftables fullcone expression kernel module (single-module build for Linux 6.6+)
endef

# 适配 Linux 6.6+：移除不兼容的函数参数
define Build/Prepare
	$(call Build/Prepare/Default)
	$(SED) 's/, const struct nft_data \*\*data//g' $(PKG_BUILD_DIR)/src/nft_ext_fullcone.c
endef

define Build/Compile
	+$(KERNEL_MAKE) M="$(PKG_BUILD_DIR)/src" modules
endef

$(eval $(call KernelPackage,nft-fullcone))
