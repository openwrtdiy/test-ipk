# SPDX-License-Identifier: GPL-2.0-only
include $(TOPDIR)/rules.mk

PKG_NAME:=fullconenat-nft
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_DATE:=2023-05-17
PKG_SOURCE_URL:=https://github.com/fullcone-nat-nftables/nft-fullcone.git
PKG_SOURCE_VERSION:=07d93b626ce5ea885cd16f9ab07fac3213c355d9
# 更新为正确的新 Hash
PKG_MIRROR_HASH:=84d54b5e6091148c31d4eddff2f8ead763c9ef318fdf35098a6f9cea9a29b7c8

PKG_MAINTAINER:=Syrone Wong <wong.syrone@gmail.com>

include $(INCLUDE_DIR)/kernel.mk
include $(INCLUDE_DIR)/package.mk

define KernelPackage/nft-fullcone
  SUBMENU:=Netfilter Extensions
  DEPENDS:=+kmod-nft-nat
  TITLE:=Netfilter nf_tables fullcone support
  FILES:= $(PKG_BUILD_DIR)/src/*.ko
  KCONFIG:= \
    CONFIG_NF_CONNTRACK_EVENTS=y \
    CONFIG_NF_CONNTRACK_CHAIN_EVENTS=y
  AUTOLOAD:=$(call AutoProbe,nf_nat_fullcone nft_ext_fullcone)
endef

define KernelPackage/nft-fullcone/Description
  nftables fullcone expression kernel module
endef

# 关键修复：使用 SED 直接修改源码，绕过补丁文件格式问题
define Build/Prepare
	$(call Build/Prepare/Default)
	# 精确修复：删除逗号及其后的参数内容，以适配 Linux 6.6
	$(SED) 's/, const struct nft_data \*\*data//g' $(PKG_BUILD_DIR)/src/nft_ext_fullcone.c
endef

define Build/Compile
	+$(KERNEL_MAKE) M="$(PKG_BUILD_DIR)/src" modules
endef

$(eval $(call KernelPackage,nft-fullcone))

