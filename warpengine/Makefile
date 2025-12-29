# SPDX-License-Identifier: GPL-3.0
include $(TOPDIR)/rules.mk

PKG_NAME:=warpengine
PKG_VERSION:=2025.12.30
PKG_RELEASE:=6

PKG_LICENSE:=GPL-3.0
PKG_MAINTAINER:=Your Name <your.email@example.com>

include $(INCLUDE_DIR)/package.mk

define Package/warpengine
  SECTION:=net
  CATEGORY:=Network
  TITLE:=WarpEngine High-speed Forwarding Engine
  DEPENDS:=+firewall4 +kmod-nft-offload +kmod-tcp-bbr +kmod-nft-fullcone +tc-tiny +ethtool \
           +@PACKAGE_bind-dig +@PACKAGE_kmod-sched-cake +@PACKAGE_irqbalance
endef

define Package/warpengine/description
 Full-stack network acceleration for OpenWrt 24.10+ with nftables/fw4.
 Supports Flow Offloading, BBR, CAKE, FullCone NAT, DNS optimization, and multi-core tuning.
endef

define Build/Compile
	# Pure shell script package – no compilation required.
endef

define Package/warpengine/install
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_DATA) ./files/etc/config/warpengine $(1)/etc/config/
	$(INSTALL_BIN) ./files/etc/init.d/warpengine $(1)/etc/init.d/
endef

$(eval $(call BuildPackage,warpengine))
