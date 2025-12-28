include $(TOPDIR)/rules.mk

PKG_NAME:=warpengine
PKG_VERSION:=2025.12.28
PKG_RELEASE:=4

include $(INCLUDE_DIR)/package.mk

define Package/warpengine
  SECTION:=net
  CATEGORY:=Network
  TITLE:=WarpEngine High-speed Forwarding Engine
  DEPENDS:=+firewall4 +kmod-nft-offload +kmod-tcp-bbr +kmod-nft-fullcone +tc-tiny +kmod-sched-cake
endef

define Build/Compile
endef

define Package/warpengine/install
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DIR) $(1)/etc/init.d
	$(CP) ./files/* $(1)/
	chmod 0755 $(1)/etc/init.d/warpengine
endef

$(eval $(call BuildPackage,warpengine))
