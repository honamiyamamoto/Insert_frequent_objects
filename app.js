const TAB_CONFIG = {
  images: { label: "画像" },
  objects: { label: "オブジェクト" },
  user: { label: "ユーザカスタム" }
};

const BASE_TAB_ORDER = ["images", "objects", "user"];
const DEFAULT_FAVORITE_TAB_ID = "fav-01";
const DEFAULT_FAVORITE_TAB_LABEL = "お気に入り";
const MODAL_RESIZE_EDGE_SIZE = 10;

const OBJECT_TEMPLATE_DEFS = {
  arrow: { label: "矢印", shapeKind: "arrow", fillColor: "#4aa6ff", strokeColor: "#d8edff", text: "Flow" },
  frame: { label: "枠", shapeKind: "frame", fillColor: "#213044", strokeColor: "#8fc4ff", text: "POINT" },
  speech: { label: "吹き出し", shapeKind: "speechBubble", fillColor: "#2f7f74", strokeColor: "#b6f6ed", text: "Talk" },
  headlineBand: { label: "見出し帯", shapeKind: "headlineBand", fillColor: "#c35e32", strokeColor: "#ffd7c6", text: "HEAD" },
  label: { label: "ラベル", shapeKind: "label", fillColor: "#6f52c8", strokeColor: "#efe5ff", text: "Tag" },
  numberCircle: { label: "丸数字", shapeKind: "numberCircle", fillColor: "#d8aa29", strokeColor: "#fff3c9", text: "1" },
  emphasis: { label: "強調囲み", shapeKind: "highlightFrame", fillColor: "#24333d", strokeColor: "#7bd3ea", text: "Focus" },
  titleFrame: { label: "タイトル枠", shapeKind: "titleFrame", fillColor: "#344d7d", strokeColor: "#dce8ff", text: "TITLE" },
  callout: { label: "コールアウト", shapeKind: "callout", fillColor: "#455069", strokeColor: "#cfd7e7", text: "Note" },
  ribbon: { label: "帯", shapeKind: "ribbon", fillColor: "#b44561", strokeColor: "#ffd4de", text: "NEWS" },
  iconPanel: { label: "アイコン風パーツ", shapeKind: "iconPanel", fillColor: "#275c78", strokeColor: "#d0efff", text: "UI" },
  roundedLabel: { label: "丸角ラベル", shapeKind: "roundedLabel", fillColor: "#49743a", strokeColor: "#ddffd1", text: "INFO" }
};

const dom = {
  openModalButton: document.getElementById("openModalButton"),
  modalOverlay: document.getElementById("modalOverlay"),
  modalWindow: document.getElementById("modalWindow"),
  modalHeader: document.getElementById("modalHeader"),
  modalResizeHandle: document.getElementById("modalResizeHandle"),
  closeModalButton: document.getElementById("closeModalButton"),
  tabRow: document.getElementById("tabRow"),
  searchInput: document.getElementById("searchInput"),
  cardGrid: document.getElementById("cardGrid"),
  emptyState: document.getElementById("emptyState"),
  itemCount: document.getElementById("itemCount"),
  renameFavoriteTabButton: document.getElementById("renameFavoriteTabButton"),
  statusMessage: document.getElementById("statusMessage"),
  insertButton: document.getElementById("insertButton"),
  cancelButton: document.getElementById("cancelButton"),
  addUserItemButton: document.getElementById("addUserItemButton"),
  addDialogOverlay: document.getElementById("addDialogOverlay"),
  closeAddDialogButton: document.getElementById("closeAddDialogButton"),
  cancelAddDialogButton: document.getElementById("cancelAddDialogButton"),
  addItemForm: document.getElementById("addItemForm"),
  itemNameInput: document.getElementById("itemNameInput"),
  itemTypeSelect: document.getElementById("itemTypeSelect"),
  imageFields: document.getElementById("imageFields"),
  objectFields: document.getElementById("objectFields"),
  imageFileInput: document.getElementById("imageFileInput"),
  imagePreview: document.getElementById("imagePreview"),
  objectPreview: document.getElementById("objectPreview"),
  formError: document.getElementById("formError"),
  objectPickStatus: document.getElementById("objectPickStatus"),
  pickSlideObjectButton: document.getElementById("pickSlideObjectButton"),
  slideObjectLayer: document.getElementById("slideObjectLayer"),
  slideEmptyState: document.getElementById("slideEmptyState"),
  insertedCountBadge: document.getElementById("insertedCountBadge"),
  latestInsertInfo: document.getElementById("latestInsertInfo"),
  pickModeBanner: document.getElementById("pickModeBanner"),
  favoriteDialogOverlay: document.getElementById("favoriteDialogOverlay"),
  closeFavoriteDialogButton: document.getElementById("closeFavoriteDialogButton"),
  cancelFavoriteDialogButton: document.getElementById("cancelFavoriteDialogButton"),
  saveFavoriteDialogButton: document.getElementById("saveFavoriteDialogButton"),
  favoriteDialogDescription: document.getElementById("favoriteDialogDescription"),
  favoriteTabChecklist: document.getElementById("favoriteTabChecklist")
};

function setOverlayVisibility(element, visible) {
  element.hidden = !visible;
  if (!visible) {
    element.style.display = "none";
    return;
  }

  element.style.display = element.classList.contains("modal-overlay") ? "block" : "grid";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getResizeCursor(direction) {
  const map = {
    top: "ns-resize",
    right: "ew-resize",
    bottom: "ns-resize",
    left: "ew-resize",
    "top-left": "nwse-resize",
    "bottom-right": "nwse-resize",
    "top-right": "nesw-resize",
    "bottom-left": "nesw-resize"
  };
  return map[direction] || "";
}

function getModalResizeDirection(event) {
  const rect = dom.modalWindow.getBoundingClientRect();
  const nearLeft = event.clientX - rect.left <= MODAL_RESIZE_EDGE_SIZE;
  const nearRight = rect.right - event.clientX <= MODAL_RESIZE_EDGE_SIZE;
  const nearTop = event.clientY - rect.top <= MODAL_RESIZE_EDGE_SIZE;
  const nearBottom = rect.bottom - event.clientY <= MODAL_RESIZE_EDGE_SIZE;

  if (nearTop && nearLeft) {
    return "top-left";
  }
  if (nearTop && nearRight) {
    return "top-right";
  }
  if (nearBottom && nearLeft) {
    return "bottom-left";
  }
  if (nearBottom && nearRight) {
    return "bottom-right";
  }
  if (nearTop) {
    return "top";
  }
  if (nearRight) {
    return "right";
  }
  if (nearBottom) {
    return "bottom";
  }
  if (nearLeft) {
    return "left";
  }
  return "";
}

function getModalConstraints() {
  const maxWidth = Math.max(420, window.innerWidth - 24);
  const maxHeight = Math.max(320, window.innerHeight - 24);

  return {
    minWidth: Math.min(620, maxWidth),
    maxWidth,
    minHeight: Math.min(420, maxHeight),
    maxHeight
  };
}

function clampModalWindowRect(rect) {
  const constraints = getModalConstraints();
  const width = clamp(rect.width, constraints.minWidth, constraints.maxWidth);
  const height = clamp(rect.height, constraints.minHeight, constraints.maxHeight);

  return {
    left: clamp(rect.left, 12, window.innerWidth - width - 12),
    top: clamp(rect.top, 12, window.innerHeight - height - 12),
    width,
    height,
    initialized: true
  };
}

function applyModalWindowRect() {
  const rect = clampModalWindowRect(state.modalWindowRect);
  state.modalWindowRect = rect;
  dom.modalWindow.style.left = `${rect.left}px`;
  dom.modalWindow.style.top = `${rect.top}px`;
  dom.modalWindow.style.width = `${rect.width}px`;
  dom.modalWindow.style.height = `${rect.height}px`;
}

function initializeModalWindowRect(forceReset = false) {
  if (state.modalWindowRect.initialized && !forceReset) {
    applyModalWindowRect();
    return;
  }

  const constraints = getModalConstraints();
  const width = Math.min(840, constraints.maxWidth);
  const height = Math.min(640, constraints.maxHeight);
  const rect = {
    left: Math.max(12, window.innerWidth - width - 72),
    top: Math.max(12, Math.min(118, window.innerHeight - height - 12)),
    width,
    height,
    initialized: true
  };

  state.modalWindowRect = clampModalWindowRect(rect);
  applyModalWindowRect();
}

function stopModalInteraction() {
  if (!state.modalInteraction) {
    return;
  }

  state.modalInteraction = null;
  document.removeEventListener("pointermove", handleModalInteractionMove);
  document.removeEventListener("pointerup", stopModalInteraction);
  document.body.classList.remove("is-dragging-modal", "is-resizing-modal");
  document.body.style.removeProperty("--modal-resize-cursor");
  dom.modalWindow.style.cursor = "";
}

function handleModalInteractionMove(event) {
  if (!state.modalInteraction) {
    return;
  }

  const { mode, startX, startY, startLeft, startTop, startWidth, startHeight, resizeDirection } = state.modalInteraction;
  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;

  if (mode === "drag") {
    state.modalWindowRect = clampModalWindowRect({
      ...state.modalWindowRect,
      left: startLeft + deltaX,
      top: startTop + deltaY,
      width: startWidth,
      height: startHeight
    });
  } else {
    const constraints = getModalConstraints();
    const viewportRight = window.innerWidth - 12;
    const viewportBottom = window.innerHeight - 12;
    let left = startLeft;
    let top = startTop;
    let right = startLeft + startWidth;
    let bottom = startTop + startHeight;

    if (resizeDirection.includes("left")) {
      left = clamp(startLeft + deltaX, 12, right - constraints.minWidth);
    }
    if (resizeDirection.includes("right")) {
      right = clamp(startLeft + startWidth + deltaX, left + constraints.minWidth, viewportRight);
    }
    if (resizeDirection.includes("top")) {
      top = clamp(startTop + deltaY, 12, bottom - constraints.minHeight);
    }
    if (resizeDirection.includes("bottom")) {
      bottom = clamp(startTop + startHeight + deltaY, top + constraints.minHeight, viewportBottom);
    }

    if (right - left > constraints.maxWidth) {
      if (resizeDirection.includes("left") && !resizeDirection.includes("right")) {
        left = right - constraints.maxWidth;
      } else {
        right = left + constraints.maxWidth;
      }
    }

    if (bottom - top > constraints.maxHeight) {
      if (resizeDirection.includes("top") && !resizeDirection.includes("bottom")) {
        top = bottom - constraints.maxHeight;
      } else {
        bottom = top + constraints.maxHeight;
      }
    }

    state.modalWindowRect = clampModalWindowRect({
      ...state.modalWindowRect,
      left,
      top,
      width: right - left,
      height: bottom - top
    });
  }

  applyModalWindowRect();
}

function beginModalInteraction(mode, event, resizeDirection = "") {
  if (mode === "drag" && event.target.closest("button, input, select, textarea")) {
    return;
  }

  event.preventDefault();
  const rect = dom.modalWindow.getBoundingClientRect();
  state.modalInteraction = {
    mode,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: rect.left,
    startTop: rect.top,
    startWidth: rect.width,
    startHeight: rect.height,
    resizeDirection
  };

  document.addEventListener("pointermove", handleModalInteractionMove);
  document.addEventListener("pointerup", stopModalInteraction);
  document.body.classList.add(mode === "drag" ? "is-dragging-modal" : "is-resizing-modal");
  if (mode === "resize") {
    const resizeCursor = getResizeCursor(resizeDirection);
    document.body.style.setProperty("--modal-resize-cursor", resizeCursor);
    dom.modalWindow.style.cursor = resizeCursor;
  }
}

function handleModalWindowPointerMove(event) {
  if (state.modalInteraction) {
    return;
  }

  const resizeDirection = getModalResizeDirection(event);
  dom.modalWindow.style.cursor = getResizeCursor(resizeDirection);
}

function handleModalWindowPointerLeave() {
  if (!state.modalInteraction) {
    dom.modalWindow.style.cursor = "";
  }
}

function handleModalWindowPointerDown(event) {
  if (event.target.closest("#modalResizeHandle")) {
    return;
  }

  const resizeDirection = getModalResizeDirection(event);
  if (!resizeDirection) {
    return;
  }

  event.stopPropagation();
  beginModalInteraction("resize", event, resizeDirection);
}

function handleWindowResize() {
  if (!state.modalWindowRect.initialized) {
    return;
  }

  applyModalWindowRect();
}

function svgToDataUri(svgMarkup) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createFavoriteTab(id, label) {
  return { id, label };
}

function getFavoriteTabKey(favoriteTabId) {
  return `favorite:${favoriteTabId}`;
}

function isFavoriteTabKey(tab) {
  return typeof tab === "string" && tab.startsWith("favorite:");
}

function getFavoriteTabIdFromKey(tab) {
  return isFavoriteTabKey(tab) ? tab.slice("favorite:".length) : null;
}

function getFavoriteTabById(favoriteTabId) {
  return state.favoriteTabs.find((tab) => tab.id === favoriteTabId) || null;
}

function normalizeFavoriteTabIds(favoriteTabIds = []) {
  return [...new Set(favoriteTabIds.filter(Boolean))];
}

function setItemFavoriteTabs(item, favoriteTabIds) {
  item.favoriteTabIds = normalizeFavoriteTabIds(favoriteTabIds);
  item.favorite = item.favoriteTabIds.length > 0;
}

function getTabLabel(tab) {
  if (TAB_CONFIG[tab]) {
    return TAB_CONFIG[tab].label;
  }

  const favoriteTab = getFavoriteTabById(getFavoriteTabIdFromKey(tab) || tab);
  return favoriteTab ? favoriteTab.label : "";
}

function getFavoriteTabLabelsForItem(item) {
  return item.favoriteTabIds
    .map((favoriteTabId) => getFavoriteTabById(favoriteTabId))
    .filter(Boolean)
    .map((favoriteTab) => favoriteTab.label);
}

function getTypeLabel(type) {
  return type === "image" ? "画像" : "オブジェクト";
}

function motifPath(kind) {
  const map = {
    skyline: "M28 100 L60 72 L88 88 L118 52 L150 78 L182 44 L212 68",
    wave: "M22 98 C50 58, 84 58, 112 98 S174 138, 214 86",
    steps: "M34 102 L70 102 L70 74 L104 74 L104 52 L138 52 L138 34 L182 34",
    orbit: "M50 84 C80 40, 156 40, 190 84 C156 124, 80 124, 50 84",
    branch: "M42 112 L96 70 L134 88 L198 42",
    ring: "M70 84 A50 34 0 1 1 170 84 A50 34 0 1 1 70 84",
    dots: "M40 108 L88 72 L116 90 L152 58 L188 76",
    peak: "M26 110 L70 56 L110 92 L148 46 L214 98",
    panels: "M36 44 H204 M36 82 H204 M36 120 H204",
    mesh: "M46 40 L192 120 M192 40 L46 120 M120 28 V132",
    focus: "M54 44 H186 V116 H54 Z M74 64 H166 V96 H74 Z",
    spark: "M58 106 L102 70 L124 88 L154 54 L184 70"
  };
  return map[kind] || map.wave;
}

function createImagePreviewSvg(title, palette, motif) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
      <defs>
        <linearGradient id="g-${motif}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </linearGradient>
      </defs>
      <rect width="240" height="160" rx="22" fill="url(#g-${motif})"/>
      <rect x="18" y="18" width="204" height="124" rx="18" fill="rgba(255,255,255,0.12)"/>
      <g fill="none" stroke="rgba(255,255,255,0.64)" stroke-width="4">
        <path d="${motifPath(motif)}" />
      </g>
      <circle cx="44" cy="44" r="14" fill="rgba(255,255,255,0.72)"/>
      <text x="24" y="132" fill="white" font-size="18" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${title}</text>
    </svg>
  `;
}

function createObjectSvg(templateType, overrides = {}) {
  const base = OBJECT_TEMPLATE_DEFS[templateType];
  const fillColor = overrides.fillColor || base.fillColor;
  const strokeColor = overrides.strokeColor || base.strokeColor;
  const text = overrides.text || base.text;

  switch (templateType) {
    case "arrow":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <path d="M38 80 H136 V52 L202 80 L136 108 V80 H38 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4" stroke-linejoin="round"/>
          <text x="64" y="72" fill="${strokeColor}" font-size="18" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "frame":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <rect x="34" y="28" width="172" height="104" rx="16" fill="${fillColor}" stroke="${strokeColor}" stroke-width="5"/>
          <rect x="58" y="48" width="124" height="12" rx="6" fill="${strokeColor}" opacity="0.9"/>
          <rect x="58" y="74" width="96" height="10" rx="5" fill="${strokeColor}" opacity="0.45"/>
          <rect x="58" y="94" width="76" height="10" rx="5" fill="${strokeColor}" opacity="0.3"/>
        </svg>
      `;
    case "speech":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <path d="M40 34 H192 Q210 34 210 52 V96 Q210 116 192 116 H112 L76 136 L84 116 H40 Q24 116 24 100 V52 Q24 34 40 34 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4" stroke-linejoin="round"/>
          <text x="64" y="78" fill="${strokeColor}" font-size="20" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "headlineBand":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <path d="M28 46 H188 L212 80 L188 114 H28 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4" stroke-linejoin="round"/>
          <text x="56" y="88" fill="${strokeColor}" font-size="24" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "label":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <path d="M34 50 H138 L172 80 L138 110 H34 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4" stroke-linejoin="round"/>
          <text x="64" y="88" fill="${strokeColor}" font-size="24" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "numberCircle":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <circle cx="120" cy="80" r="42" fill="${fillColor}" stroke="${strokeColor}" stroke-width="5"/>
          <text x="120" y="93" text-anchor="middle" fill="${strokeColor}" font-size="38" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "emphasis":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <rect x="38" y="34" width="164" height="92" rx="14" fill="${fillColor}" stroke="${strokeColor}" stroke-width="5" stroke-dasharray="10 8"/>
          <text x="120" y="88" text-anchor="middle" fill="${strokeColor}" font-size="24" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "titleFrame":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <rect x="32" y="34" width="176" height="90" rx="14" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4"/>
          <rect x="48" y="48" width="144" height="20" rx="8" fill="${strokeColor}" opacity="0.95"/>
          <text x="120" y="103" text-anchor="middle" fill="${strokeColor}" font-size="20" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "callout":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <circle cx="80" cy="78" r="30" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4"/>
          <path d="M114 88 L172 46" stroke="${strokeColor}" stroke-width="4" stroke-linecap="round"/>
          <circle cx="178" cy="42" r="14" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4"/>
          <text x="80" y="86" text-anchor="middle" fill="${strokeColor}" font-size="18" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "ribbon":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <path d="M42 46 H198 V108 H42 Z M42 108 L68 132 V108 M198 108 L172 132 V108" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4" stroke-linejoin="round"/>
          <text x="120" y="90" text-anchor="middle" fill="${strokeColor}" font-size="24" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    case "iconPanel":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <rect x="34" y="32" width="172" height="96" rx="16" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4"/>
          <circle cx="76" cy="80" r="22" fill="${strokeColor}" opacity="0.22"/>
          <path d="M76 68 V92 M64 80 H88" stroke="${strokeColor}" stroke-width="5" stroke-linecap="round"/>
          <rect x="112" y="60" width="60" height="10" rx="5" fill="${strokeColor}" opacity="0.95"/>
          <rect x="112" y="82" width="44" height="10" rx="5" fill="${strokeColor}" opacity="0.55"/>
        </svg>
      `;
    case "roundedLabel":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <rect x="44" y="50" width="152" height="60" rx="30" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4"/>
          <text x="120" y="88" text-anchor="middle" fill="${strokeColor}" font-size="22" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
    default:
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
          <rect width="240" height="160" rx="20" fill="#0f1621"/>
          <rect x="36" y="36" width="168" height="88" rx="18" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4"/>
          <text x="120" y="88" text-anchor="middle" fill="${strokeColor}" font-size="22" font-family="Aptos, Yu Gothic UI, sans-serif" font-weight="700">${text}</text>
        </svg>
      `;
  }
}

function createImageItem(config) {
  const favoriteTabIds = normalizeFavoriteTabIds(
    config.favoriteTabIds || (config.favorite ? [DEFAULT_FAVORITE_TAB_ID] : [])
  );

  return {
    id: config.id,
    name: config.name,
    type: "image",
    favorite: favoriteTabIds.length > 0,
    favoriteTabIds,
    sourceTab: config.sourceTab,
    source: config.sourceTab,
    preview: {
      mode: "image",
      src: config.imageSrc,
      kind: config.imageKind
    },
    searchKeywords: config.keywords,
    searchableText: `${config.name} ${config.imageKind} ${config.keywords.join(" ")}`.toLowerCase(),
    imageSrc: config.imageSrc,
    imageKind: config.imageKind,
    fileName: config.fileName,
    mimeType: config.mimeType,
    dataSummary: {
      imageKind: config.imageKind,
      fileName: config.fileName,
      palette: config.palette,
      keywords: config.keywords
    }
  };
}

function createEditableItem(config) {
  const favoriteTabIds = normalizeFavoriteTabIds(
    config.favoriteTabIds || (config.favorite ? [DEFAULT_FAVORITE_TAB_ID] : [])
  );

  return {
    id: config.id,
    name: config.name,
    type: "editableObject",
    favorite: favoriteTabIds.length > 0,
    favoriteTabIds,
    sourceTab: config.sourceTab,
    source: config.sourceTab,
    preview: {
      mode: "svg",
      svgMarkup: config.svgMarkup,
      templateType: config.templateType
    },
    searchKeywords: config.keywords,
    searchableText: `${config.name} ${config.templateType} ${config.editableProps.text} ${config.keywords.join(" ")}`.toLowerCase(),
    templateType: config.templateType,
    svgMarkup: config.svgMarkup,
    objectDefinition: config.objectDefinition,
    editableProps: config.editableProps,
    dataSummary: {
      templateType: config.templateType,
      shapeKind: config.objectDefinition.shapeKind,
      fillColor: config.editableProps.fillColor,
      strokeColor: config.editableProps.strokeColor,
      text: config.editableProps.text
    }
  };
}

function countSvgElements(svgMarkup) {
  return (svgMarkup.match(/<path|<rect|<circle|<text/g) || []).length;
}

function createEditableTemplateItem(id, name, templateType, text, sourceTab = "objects", favorite = false) {
  const base = OBJECT_TEMPLATE_DEFS[templateType];
  const editableProps = {
    fillColor: base.fillColor,
    strokeColor: base.strokeColor,
    text
  };
  const svgMarkup = createObjectSvg(templateType, editableProps);

  return createEditableItem({
    id,
    name,
    sourceTab,
    favorite,
    templateType,
    svgMarkup,
    objectDefinition: {
      shapeKind: base.shapeKind,
      templateType,
      elementCount: countSvgElements(svgMarkup),
      layoutHint: `${base.label}レイアウト`
    },
    editableProps,
    keywords: [base.label, text, sourceTab === "user" ? "ユーザカスタム" : "オブジェクト"]
  });
}

function createSampleImages() {
  const seeds = [
    ["img-01", "会議風景", ["#6e8dff", "#304578"], "skyline", "businessPhoto", ["会議", "資料", "人物"]],
    ["img-02", "都市ライン", ["#1f8ec7", "#14324f"], "wave", "backgroundImage", ["都市", "ブルー", "背景"]],
    ["img-03", "工程ステップ", ["#20b593", "#0f5f55"], "steps", "processGraphic", ["工程", "ステップ", "進行"]],
    ["img-04", "分析サークル", ["#ca7cff", "#5f2c8a"], "orbit", "abstractGraphic", ["分析", "円", "データ"]],
    ["img-05", "分岐イメージ", ["#ff8b7b", "#7b2f35"], "branch", "conceptArt", ["分岐", "比較", "検討"]],
    ["img-06", "リング構成", ["#ffcb5f", "#7a5124"], "ring", "diagramLikeImage", ["リング", "循環", "構成"]],
    ["img-07", "ドット接続", ["#5fd3c2", "#1c5b67"], "dots", "networkGraphic", ["接続", "ネットワーク", "点"]],
    ["img-08", "山型レイアウト", ["#8f99ff", "#4248a7"], "peak", "heroImage", ["山型", "頂点", "推移"]],
    ["img-09", "パネル一覧", ["#7c8fa7", "#313f52"], "panels", "uiMockImage", ["パネル", "一覧", "画面"]],
    ["img-10", "メッシュ図", ["#57b7ff", "#16436b"], "mesh", "technicalImage", ["メッシュ", "技術", "線"]],
    ["img-11", "フォーカス枠", ["#75d698", "#245440"], "focus", "accentImage", ["フォーカス", "枠", "強調"]],
    ["img-12", "スパーク線", ["#f28b89", "#6f283a"], "spark", "motionImage", ["スパーク", "流れ", "動き"]]
  ];

  return seeds.map(([id, name, palette, motif, imageKind, keywords]) => {
    const svgMarkup = createImagePreviewSvg(name, palette, motif);
    return createImageItem({
      id,
      name,
      sourceTab: "images",
      imageSrc: svgToDataUri(svgMarkup),
      imageKind,
      fileName: `${id}.svg`,
      mimeType: "image/svg+xml",
      palette,
      keywords
    });
  });
}

function createSampleObjects() {
  const definitions = [
    ["obj-01", "右向き矢印", "arrow", "NEXT"],
    ["obj-02", "吹き出しメモ", "speech", "Talk"],
    ["obj-03", "見出し枠", "frame", "POINT"],
    ["obj-04", "強調囲み", "emphasis", "Focus"],
    ["obj-05", "丸数字 1", "numberCircle", "1"],
    ["obj-06", "ラベルタグ", "label", "Tag"],
    ["obj-07", "コールアウト", "callout", "Note"],
    ["obj-08", "帯見出し", "ribbon", "NEWS"],
    ["obj-09", "タイトル枠", "titleFrame", "TITLE"],
    ["obj-10", "アイコンパネル", "iconPanel", "UI"],
    ["obj-11", "丸角ラベル", "roundedLabel", "INFO"],
    ["obj-12", "見出し帯", "headlineBand", "HEAD"]
  ];

  return definitions.map(([id, name, templateType, text]) =>
    createEditableTemplateItem(id, name, templateType, text, "objects")
  );
}

function createInitialUserItems() {
  const imageSvg = createImagePreviewSvg("営業チーム", ["#5c8cff", "#283f76"], "skyline");

  return {
    images: [
      createImageItem({
        id: "user-01",
        name: "営業チーム写真",
        sourceTab: "user",
        imageSrc: svgToDataUri(imageSvg),
        imageKind: "userUploadedSample",
        fileName: "sales-team.svg",
        mimeType: "image/svg+xml",
        palette: ["#5c8cff", "#283f76"],
        keywords: ["営業", "チーム", "写真"]
      })
    ],
    editableObjects: [
      createEditableTemplateItem("user-02", "見積ラベル", "label", "Quote", "user"),
      createEditableTemplateItem("user-03", "説明用吹き出し", "speech", "Guide", "user")
    ]
  };
}

const state = {
  activeTab: "objects",
  searchQuery: "",
  selectedItemIds: [],
  insertedItems: [],
  favoriteTabs: [createFavoriteTab(DEFAULT_FAVORITE_TAB_ID, DEFAULT_FAVORITE_TAB_LABEL)],
  pickedSlideItemId: null,
  editingItemId: null,
  nameEditDraft: "",
  modalWindowRect: {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    initialized: false
  },
  modalInteraction: null,
  modalOpen: false,
  addDialogOpen: false,
  favoriteDialogOpen: false,
  objectPickMode: false,
  nextFavoriteTabId: 2,
  nextUserId: 4,
  nextInsertedId: 1,
  pendingUpload: null,
  pendingObjectSource: null,
  favoriteDialogItemId: null,
  collections: {
    images: createSampleImages(),
    objects: createSampleObjects(),
    user: createInitialUserItems()
  }
};

function getAllItems() {
  return [
    ...state.collections.images,
    ...state.collections.objects,
    ...state.collections.user.images,
    ...state.collections.user.editableObjects
  ];
}

function findItemById(id) {
  return getAllItems().find((item) => item.id === id) || null;
}

function getItemsForTab(tab) {
  if (tab === "images") {
    return state.collections.images;
  }
  if (tab === "objects") {
    return state.collections.objects;
  }
  if (tab === "user") {
    return [
      ...state.collections.user.images,
      ...state.collections.user.editableObjects
    ];
  }
  if (isFavoriteTabKey(tab)) {
    const favoriteTabId = getFavoriteTabIdFromKey(tab);
    return getAllItems().filter((item) => item.favoriteTabIds.includes(favoriteTabId));
  }
  return [];
}

function getFilteredItems() {
  const query = state.searchQuery.trim().toLowerCase();
  const items = getItemsForTab(state.activeTab);
  if (!query) {
    return items;
  }
  return items.filter((item) => item.searchableText.includes(query));
}

function isItemSelected(itemId) {
  return state.selectedItemIds.includes(itemId);
}

function buildSearchableText(item) {
  const keywords = item.searchKeywords || [];
  if (item.type === "image") {
    return `${item.name} ${item.imageKind || ""} ${keywords.join(" ")}`.toLowerCase();
  }
  return `${item.name} ${item.templateType || ""} ${item.editableProps?.text || ""} ${keywords.join(" ")}`.toLowerCase();
}

function clearSelection() {
  state.selectedItemIds = [];
  state.editingItemId = null;
  state.nameEditDraft = "";
}

function setActiveTab(tab) {
  if (!TAB_CONFIG[tab] && !isFavoriteTabKey(tab)) {
    return;
  }
  state.activeTab = tab;
  state.searchQuery = "";
  clearSelection();
  dom.searchInput.value = "";
  render();
}

function setSearchQuery(value) {
  state.searchQuery = value;
  clearSelection();
  render();
}

function toggleCardSelection(itemId) {
  if (isItemSelected(itemId)) {
    state.selectedItemIds = state.selectedItemIds.filter((id) => id !== itemId);
  } else {
    state.selectedItemIds = [...state.selectedItemIds, itemId];
  }

  if (state.selectedItemIds.length !== 1 || state.selectedItemIds[0] !== state.editingItemId) {
    state.editingItemId = null;
    state.nameEditDraft = "";
  }

  render();
}

function buildFavoriteTabDefaultLabel() {
  if (!state.favoriteTabs.some((favoriteTab) => favoriteTab.label === DEFAULT_FAVORITE_TAB_LABEL)) {
    return DEFAULT_FAVORITE_TAB_LABEL;
  }

  let index = 2;
  let candidate = `お気に入り ${index}`;
  while (state.favoriteTabs.some((favoriteTab) => favoriteTab.label === candidate)) {
    index += 1;
    candidate = `お気に入り ${index}`;
  }

  return candidate;
}

function hasFavoriteTabLabel(label, ignoredFavoriteTabId = null) {
  return state.favoriteTabs.some((favoriteTab) =>
    favoriteTab.id !== ignoredFavoriteTabId && favoriteTab.label === label
  );
}

function requestFavoriteTabLabel(initialValue, ignoredFavoriteTabId = null) {
  let draft = initialValue;

  while (true) {
    const nextLabel = window.prompt("お気に入りタブ名を入力してください。", draft);
    if (nextLabel === null) {
      return null;
    }

    const trimmed = nextLabel.trim();
    if (!trimmed) {
      window.alert("タブ名を入力してください。");
      draft = initialValue;
      continue;
    }

    if (hasFavoriteTabLabel(trimmed, ignoredFavoriteTabId)) {
      window.alert("同じ名前のタブは使えません。");
      draft = trimmed;
      continue;
    }

    return trimmed;
  }
}

function promptRenameFavoriteTab(favoriteTabId) {
  const favoriteTab = getFavoriteTabById(favoriteTabId);
  if (!favoriteTab) {
    return;
  }

  const nextLabel = requestFavoriteTabLabel(favoriteTab.label, favoriteTab.id);
  if (nextLabel === null) {
    return;
  }

  favoriteTab.label = nextLabel;
  render();
}

function renameActiveFavoriteTab() {
  if (!isFavoriteTabKey(state.activeTab)) {
    return;
  }

  const favoriteTabId = getFavoriteTabIdFromKey(state.activeTab);
  if (favoriteTabId) {
    promptRenameFavoriteTab(favoriteTabId);
  }
}

function addFavoriteTab() {
  const nextLabel = requestFavoriteTabLabel(buildFavoriteTabDefaultLabel());
  if (nextLabel === null) {
    return;
  }

  const favoriteTabId = `fav-${String(state.nextFavoriteTabId).padStart(2, "0")}`;
  state.nextFavoriteTabId += 1;
  state.favoriteTabs.push(createFavoriteTab(favoriteTabId, nextLabel));
  setActiveTab(getFavoriteTabKey(favoriteTabId));
}

function openFavoriteDialog(itemId) {
  const item = findItemById(itemId);
  if (!item) {
    return;
  }

  state.favoriteDialogItemId = itemId;
  state.favoriteDialogOpen = true;
  setOverlayVisibility(dom.favoriteDialogOverlay, true);
  renderFavoriteDialog();
}

function closeFavoriteDialog() {
  state.favoriteDialogOpen = false;
  state.favoriteDialogItemId = null;
  setOverlayVisibility(dom.favoriteDialogOverlay, false);
  dom.favoriteDialogDescription.textContent = "";
  dom.favoriteTabChecklist.innerHTML = "";
}

function saveFavoriteDialog() {
  const item = findItemById(state.favoriteDialogItemId);
  if (!item) {
    closeFavoriteDialog();
    return;
  }

  const favoriteTabIds = Array.from(
    dom.favoriteTabChecklist.querySelectorAll("input[type='checkbox']:checked")
  ).map((input) => input.dataset.favoriteTabId);

  setItemFavoriteTabs(item, favoriteTabIds);

  if (isFavoriteTabKey(state.activeTab)) {
    const activeFavoriteTabId = getFavoriteTabIdFromKey(state.activeTab);
    if (!item.favoriteTabIds.includes(activeFavoriteTabId)) {
      state.selectedItemIds = state.selectedItemIds.filter((id) => id !== item.id);
    }
  }

  closeFavoriteDialog();
  render();
}

function deleteUserItem(itemId) {
  if (!window.confirm("このユーザカスタムアイテムを削除しますか？")) {
    return;
  }
  state.collections.user.images = state.collections.user.images.filter((item) => item.id !== itemId);
  state.collections.user.editableObjects = state.collections.user.editableObjects.filter((item) => item.id !== itemId);
  state.selectedItemIds = state.selectedItemIds.filter((id) => id !== itemId);
  render();
}

function startInlineNameEdit(itemId) {
  const item = findItemById(itemId);
  if (!item) {
    return;
  }

  state.editingItemId = itemId;
  state.nameEditDraft = item.name;
  render();

  requestAnimationFrame(() => {
    const input = dom.selectionDetails.querySelector("[data-role='name-edit-input']");
    if (!input) {
      return;
    }
    input.focus();
    input.select();
  });
}

function cancelInlineNameEdit() {
  if (!state.editingItemId) {
    return;
  }

  state.editingItemId = null;
  state.nameEditDraft = "";
  render();
}

function updateInlineNameDraft(value) {
  state.nameEditDraft = value;

  const saveButton = dom.selectionDetails.querySelector("[data-action='save-name-edit']");
  if (saveButton) {
    saveButton.disabled = value.trim().length === 0;
  }
}

function commitInlineNameEdit() {
  if (!state.editingItemId) {
    return;
  }

  const item = findItemById(state.editingItemId);
  if (!item) {
    cancelInlineNameEdit();
    return;
  }

  const trimmed = state.nameEditDraft.trim();
  if (!trimmed) {
    return;
  }

  item.name = trimmed;
  item.searchableText = buildSearchableText(item);
  state.editingItemId = null;
  state.nameEditDraft = "";
  render();
}

function renameItem(itemId) {
  startInlineNameEdit(itemId);
  return;

  const item = findItemById(itemId);
  if (!item) {
    return;
  }

  const nextName = window.prompt("新しい名称を入力してください。", item.name);
  if (nextName === null) {
    return;
  }

  const trimmed = nextName.trim();
  if (!trimmed) {
    window.alert("名称を入力してください。");
    return;
  }

  item.name = trimmed;
  item.searchableText = buildSearchableText(item);
  render();
}

function openModal() {
  state.modalOpen = true;
  setOverlayVisibility(dom.modalOverlay, true);
  initializeModalWindowRect();
  document.body.style.overflow = "hidden";
  render();
}

function closeModal() {
  if (state.objectPickMode) {
    stopObjectPickMode(false);
  }
  stopModalInteraction();
  state.modalOpen = false;
  clearSelection();
  state.searchQuery = "";
  dom.searchInput.value = "";
  setOverlayVisibility(dom.modalOverlay, false);
  closeFavoriteDialog();
  closeAddDialog();
  document.body.style.overflow = "";
}

function openAddDialog() {
  state.addDialogOpen = true;
  setOverlayVisibility(dom.addDialogOverlay, true);
  resetAddDialog();
  updateAddDialogType();
}

function closeAddDialog() {
  if (state.objectPickMode) {
    stopObjectPickMode(false);
  }
  state.addDialogOpen = false;
  setOverlayVisibility(dom.addDialogOverlay, false);
}

function resetAddDialog() {
  dom.addItemForm.reset();
  state.pendingUpload = null;
  state.pendingObjectSource = null;
  hideFormError();
  dom.imagePreview.classList.add("is-empty");
  dom.imagePreview.textContent = "画像を選択してください";
  renderObjectPreviewForDialog();
}

function updateAddDialogType() {
  const isImage = dom.itemTypeSelect.value === "image";
  dom.imageFields.hidden = !isImage;
  dom.objectFields.hidden = isImage;
  hideFormError();
  renderObjectPreviewForDialog();
}

function showFormError(message) {
  dom.formError.hidden = false;
  dom.formError.textContent = message;
}

function hideFormError() {
  dom.formError.hidden = true;
  dom.formError.textContent = "";
}

function getSlideObjectCandidates() {
  return state.insertedItems.filter((item) => item.type === "editableObject");
}

function startObjectPickMode() {
  if (getSlideObjectCandidates().length === 0) {
    showFormError("先にスライド上へオブジェクトを挿入してから選択してください。");
    return;
  }

  state.objectPickMode = true;
  state.pickedSlideItemId = null;
  setOverlayVisibility(dom.addDialogOverlay, false);
  setOverlayVisibility(dom.modalOverlay, false);
  dom.pickModeBanner.hidden = false;
  renderSlideItems();
}

function stopObjectPickMode(restoreWindows = true) {
  state.objectPickMode = false;
  state.pickedSlideItemId = null;
  dom.pickModeBanner.hidden = true;

  if (restoreWindows) {
    if (state.modalOpen) {
      setOverlayVisibility(dom.modalOverlay, true);
    }
    if (state.addDialogOpen) {
      setOverlayVisibility(dom.addDialogOverlay, true);
    }
  }

  renderSlideItems();
}

function selectSlideObjectForUserAdd(slideItemId) {
  const slideItem = state.insertedItems.find((item) => item.slideItemId === slideItemId && item.type === "editableObject");
  if (!slideItem) {
    return;
  }

  state.pendingObjectSource = slideItem;
  state.pickedSlideItemId = slideItemId;
  stopObjectPickMode(true);
  renderObjectPreviewForDialog();
}

function createUserItemFromForm() {
  const name = dom.itemNameInput.value.trim();
  const type = dom.itemTypeSelect.value;

  if (!name) {
    showFormError("名前を入力してください。");
    return null;
  }

  if (type === "image") {
    if (!state.pendingUpload) {
      showFormError("画像ファイルを選択してください。");
      return null;
    }
    return createImageItem({
      id: `user-${String(state.nextUserId).padStart(2, "0")}`,
      name,
      sourceTab: "user",
      imageSrc: state.pendingUpload.src,
      imageKind: "userUpload",
      fileName: state.pendingUpload.fileName,
      mimeType: state.pendingUpload.mimeType,
      palette: ["uploaded", "uploaded"],
      keywords: ["ユーザカスタム", name]
    });
  }

  if (!state.pendingObjectSource) {
    showFormError("スライド上のオブジェクトを選択してください。");
    return null;
  }

  const source = state.pendingObjectSource;
  const templateType = source.dataSummary.templateType || source.preview.templateType || "frame";
  const svgMarkup = source.preview.svgMarkup;

  return createEditableItem({
    id: `user-${String(state.nextUserId).padStart(2, "0")}`,
    name,
    sourceTab: "user",
    templateType,
    svgMarkup,
    objectDefinition: source.dataSummary.objectDefinition || {
      shapeKind: source.dataSummary.shapeKind || "customObject",
      templateType,
      elementCount: countSvgElements(svgMarkup),
      layoutHint: "スライド選択オブジェクト"
    },
    editableProps: {
      fillColor: source.dataSummary.fillColor || "#5a93df",
      strokeColor: source.dataSummary.strokeColor || "#dbe9ff",
      text: source.dataSummary.text || name
    },
    keywords: ["ユーザカスタム", "スライド選択", name]
  });
}

function addUserItem(item) {
  if (item.type === "image") {
    state.collections.user.images.unshift(item);
  } else {
    state.collections.user.editableObjects.unshift(item);
  }
  state.nextUserId += 1;
  closeAddDialog();
  state.activeTab = "user";
  state.searchQuery = "";
  dom.searchInput.value = "";
  state.selectedItemIds = [item.id];
  render();
}

function buildInsertPayload(item) {
  const payload = {
    id: item.id,
    name: item.name,
    sourceTab: item.sourceTab,
    type: item.type,
    favorite: item.favorite,
    favoriteTabIds: [...item.favoriteTabIds],
    preview: item.preview
  };

  if (item.type === "editableObject") {
    payload.dataSummary = {
      templateType: item.templateType,
      shapeKind: item.objectDefinition.shapeKind,
      fillColor: item.editableProps.fillColor,
      strokeColor: item.editableProps.strokeColor,
      text: item.editableProps.text,
      objectDefinition: item.objectDefinition
    };
  } else {
    payload.dataSummary = {
      fileName: item.fileName,
      src: item.imageSrc,
      imageKind: item.imageKind,
      mimeType: item.mimeType
    };
  }

  return payload;
}

function createSlidePlacement(index, type) {
  const placements = [
    { x: 60, y: 170, width: 240, height: 150 },
    { x: 328, y: 170, width: 240, height: 150 },
    { x: 596, y: 170, width: 240, height: 150 },
    { x: 94, y: 346, width: 250, height: 152 },
    { x: 380, y: 346, width: 250, height: 152 },
    { x: 664, y: 346, width: 190, height: 138 }
  ];
  const base = placements[index % placements.length];
  if (type === "editableObject") {
    return {
      ...base,
      width: Math.round(base.width * 0.92),
      height: Math.round(base.height * 0.92)
    };
  }
  return base;
}

function createInsertedSlideItem(item, payload) {
  const placement = createSlidePlacement(state.insertedItems.length, item.type);
  return {
    slideItemId: `placed-${String(state.nextInsertedId).padStart(3, "0")}`,
    sourceId: item.id,
    name: item.name,
    type: item.type,
    sourceTab: item.sourceTab,
    favorite: item.favorite,
    favoriteTabIds: [...item.favoriteTabIds],
    placement,
    preview: payload.preview,
    dataSummary: payload.dataSummary
  };
}

function renderSlideItems() {
  dom.insertedCountBadge.textContent = `挿入済み ${state.insertedItems.length}件`;
  dom.slideEmptyState.hidden = state.insertedItems.length > 0;

  if (state.insertedItems.length === 0) {
    dom.slideObjectLayer.innerHTML = "";
    dom.latestInsertInfo.textContent = "まだ挿入されていません。";
    return;
  }

  dom.slideObjectLayer.innerHTML = state.insertedItems.map((item) => `
    <div
      class="slide-object ${item.type === "image" ? "is-image" : "is-object"} ${state.objectPickMode && item.type === "editableObject" ? "is-pickable" : ""} ${state.pickedSlideItemId === item.slideItemId ? "is-picked" : ""}"
      data-slide-item-id="${item.slideItemId}"
      data-slide-item-type="${item.type}"
      style="left:${item.placement.x}px; top:${item.placement.y}px; width:${item.placement.width}px; height:${item.placement.height}px;"
    >
      ${renderPreviewMarkup(item.preview)}
      <div class="slide-object-caption">${escapeHtml(item.name)}</div>
    </div>
  `).join("");

  const latest = state.insertedItems[state.insertedItems.length - 1];
  dom.latestInsertInfo.innerHTML = `
    <strong>${escapeHtml(latest.name)}</strong><br>
    種別: ${getTypeLabel(latest.type)}<br>
    元タブ: ${getTabLabel(latest.sourceTab)}
  `;
}

function insertSelectedItem() {
  const items = state.selectedItemIds
    .map((id) => findItemById(id))
    .filter(Boolean);

  if (items.length === 0) {
    return;
  }

  const payloads = items.map((item) => {
    const payload = buildInsertPayload(item);
    const slideItem = createInsertedSlideItem(item, payload);
    state.insertedItems.push(slideItem);
    state.nextInsertedId += 1;
    return payload;
  });

  console.log("Insert mock payloads:", payloads);
  dom.statusMessage.textContent = `${items.length}件のアイテムをスライドに挿入し、情報を console に出力しました。`;
  renderSlideItems();
  closeModal();
}

function renderPreviewMarkup(preview) {
  if (!preview) {
    return "";
  }
  if (preview.mode === "image") {
    return `<img src="${preview.src}" alt="">`;
  }
  return preview.svgMarkup;
}

function renderCard(item) {
  const typeLabel = getTypeLabel(item.type);
  const isSelected = isItemSelected(item.id);
  const favoriteClass = item.favorite ? "favorite-button is-active" : "favorite-button";
  const favoriteAriaLabel = item.favorite ? "お気に入り先を変更" : "お気に入りに登録";
  const selectionClass = isSelected ? "selection-toggle is-selected" : "selection-toggle";
  const selectionAriaLabel = isSelected ? `${item.name} の選択を解除` : `${item.name} を選択`;
  const deleteButton = state.activeTab === "user"
    ? `<button class="delete-button" data-action="delete" data-id="${item.id}" type="button" aria-label="削除">×</button>`
    : "";

  return `
    <article class="asset-card ${isSelected ? "is-selected" : ""}" data-id="${item.id}">
      <div class="card-actions">
        <button class="${selectionClass}" data-action="select-card" data-id="${item.id}" type="button" aria-pressed="${isSelected ? "true" : "false"}" aria-label="${escapeHtml(selectionAriaLabel)}">✓</button>
        <button class="${favoriteClass}" data-action="favorite" data-id="${item.id}" type="button" aria-label="${favoriteAriaLabel}">★</button>
        ${deleteButton}
      </div>
      <div class="asset-preview">${renderPreviewMarkup(item.preview)}</div>
      <div class="card-meta">
        <p class="card-name">${escapeHtml(item.name)}</p>
        <div class="meta-row">
          <span class="type-badge ${item.type === "image" ? "is-image" : "is-object"}">${typeLabel}</span>
        </div>
      </div>
    </article>
  `;
}

function renderCards() {
  const items = getFilteredItems();
  dom.itemCount.textContent = `${items.length}件`;

  if (items.length === 0) {
    dom.cardGrid.innerHTML = "";
    dom.emptyState.hidden = false;
    dom.emptyState.textContent = isFavoriteTabKey(state.activeTab) && !state.searchQuery
      ? "このお気に入りタブにはまだ登録がありません"
      : "該当する項目がありません";
    return;
  }

  dom.emptyState.hidden = true;
  dom.cardGrid.innerHTML = items.map(renderCard).join("");
}

function renderToolbarState() {
  dom.addUserItemButton.hidden = state.activeTab !== "user";
  dom.renameFavoriteTabButton.hidden = !isFavoriteTabKey(state.activeTab);
}

function renderSelectionDetails() {
  const items = state.selectedItemIds
    .map((id) => findItemById(id))
    .filter(Boolean);

  if (items.length === 0) {
    dom.selectionDetails.innerHTML = `
      <p class="detail-placeholder">未選択です。カードを選ぶとここに概要が表示されます。</p>
    `;
    return;
  }

  if (items.length > 1) {
    dom.selectionDetails.innerHTML = `
      <h3 class="detail-title">${items.length}件を選択中</h3>
      <div class="detail-list">
        ${items.map((item) => `
          <div class="detail-row">
            <span>${getTypeLabel(item.type)}</span>
            <strong>${escapeHtml(item.name)}</strong>
          </div>
        `).join("")}
      </div>
    `;
    return;
  }

  const [item] = items;

  const typeLabel = getTypeLabel(item.type);
  const favoriteLabels = getFavoriteTabLabelsForItem(item);
  const summaryMarkup = item.type === "image"
    ? `
      <div class="detail-row">
        <span>画像情報</span>
        <strong>${escapeHtml(item.fileName)}</strong>
      </div>
      <div class="detail-row">
        <span>imageKind</span>
        <strong>${escapeHtml(item.imageKind)}</strong>
      </div>
      <div class="detail-row">
        <span>mimeType</span>
        <strong>${escapeHtml(item.mimeType)}</strong>
      </div>
    `
    : `
      <div class="detail-row">
        <span>templateType</span>
        <strong>${escapeHtml(item.templateType)}</strong>
      </div>
      <div class="detail-row">
        <span>shapeKind</span>
        <strong>${escapeHtml(item.objectDefinition.shapeKind)}</strong>
      </div>
      <div class="detail-row">
        <span>editableProps</span>
        <strong class="detail-code">${escapeHtml(JSON.stringify(item.editableProps, null, 2))}</strong>
      </div>
    `;

  dom.selectionDetails.innerHTML = `
    <div class="detail-preview">${renderPreviewMarkup(item.preview)}</div>
    <div class="detail-title-row">
      <h3 class="detail-title">${escapeHtml(item.name)}</h3>
      <button class="detail-edit-button" data-action="edit-selected" data-id="${item.id}" type="button">編集</button>
    </div>
    <div class="detail-list">
      <div class="detail-row">
        <span>種別</span>
        <strong>${typeLabel}</strong>
      </div>
      <div class="detail-row">
        <span>元タブ</span>
        <strong>${getTabLabel(item.sourceTab)}</strong>
      </div>
      <div class="detail-row">
        <span>お気に入り</span>
        <strong>${favoriteLabels.length > 0 ? escapeHtml(favoriteLabels.join(" / ")) : "未登録"}</strong>
      </div>
      ${summaryMarkup}
    </div>
  `;
}

function renderSelectionDetailsInline() {
  const items = state.selectedItemIds
    .map((id) => findItemById(id))
    .filter(Boolean);

  if (items.length === 0) {
    dom.selectionDetails.innerHTML = `
      <p class="detail-placeholder">未選択です。カードを選ぶとここに概要が表示されます。</p>
    `;
    return;
  }

  if (items.length > 1) {
    dom.selectionDetails.innerHTML = `
      <h3 class="detail-title">${items.length}件を選択中</h3>
      <div class="detail-list">
        ${items.map((item) => `
          <div class="detail-row">
            <span>${getTypeLabel(item.type)}</span>
            <strong>${escapeHtml(item.name)}</strong>
          </div>
        `).join("")}
      </div>
    `;
    return;
  }

  const [item] = items;
  const typeLabel = getTypeLabel(item.type);
  const isEditingName = state.editingItemId === item.id;
  const favoriteLabels = getFavoriteTabLabelsForItem(item);
  const summaryMarkup = item.type === "image"
    ? `
      <div class="detail-row">
        <span>画像情報</span>
        <strong>${escapeHtml(item.fileName)}</strong>
      </div>
      <div class="detail-row">
        <span>imageKind</span>
        <strong>${escapeHtml(item.imageKind)}</strong>
      </div>
      <div class="detail-row">
        <span>mimeType</span>
        <strong>${escapeHtml(item.mimeType)}</strong>
      </div>
    `
    : `
      <div class="detail-row">
        <span>templateType</span>
        <strong>${escapeHtml(item.templateType)}</strong>
      </div>
      <div class="detail-row">
        <span>shapeKind</span>
        <strong>${escapeHtml(item.objectDefinition.shapeKind)}</strong>
      </div>
      <div class="detail-row">
        <span>editableProps</span>
        <strong class="detail-code">${escapeHtml(JSON.stringify(item.editableProps, null, 2))}</strong>
      </div>
    `;

  const titleMarkup = isEditingName
    ? `
      <div class="detail-title-row">
        <div class="detail-name-editor">
          <input
            class="detail-name-input"
            data-role="name-edit-input"
            type="text"
            value="${escapeHtml(state.nameEditDraft)}"
            maxlength="40"
          >
          <div class="detail-inline-actions">
            <button class="detail-edit-button" data-action="save-name-edit" type="button" ${state.nameEditDraft.trim() ? "" : "disabled"}>保存</button>
            <button class="detail-edit-button is-secondary" data-action="cancel-name-edit" type="button">キャンセル</button>
          </div>
        </div>
      </div>
    `
    : `
      <div class="detail-title-row">
        <h3 class="detail-title">${escapeHtml(item.name)}</h3>
        <button class="detail-edit-button" data-action="edit-selected" data-id="${item.id}" type="button">編集</button>
      </div>
    `;

  dom.selectionDetails.innerHTML = `
    <div class="detail-preview">${renderPreviewMarkup(item.preview)}</div>
    ${titleMarkup}
    <div class="detail-list">
      <div class="detail-row">
        <span>種別</span>
        <strong>${typeLabel}</strong>
      </div>
      <div class="detail-row">
        <span>元タブ</span>
        <strong>${getTabLabel(item.sourceTab)}</strong>
      </div>
      <div class="detail-row">
        <span>お気に入り</span>
        <strong>${favoriteLabels.length > 0 ? escapeHtml(favoriteLabels.join(" / ")) : "未登録"}</strong>
      </div>
      ${summaryMarkup}
    </div>
  `;
}

function renderFooterState() {
  const items = state.selectedItemIds
    .map((id) => findItemById(id))
    .filter(Boolean);

  dom.insertButton.disabled = items.length === 0;
  if (items.length === 0) {
    dom.statusMessage.textContent = "項目を選択すると「挿入」が有効になります。";
    return;
  }
  if (items.length === 1) {
    dom.statusMessage.textContent = `選択中: ${items[0].name} / ${getTypeLabel(items[0].type)}`;
    return;
  }
  dom.statusMessage.textContent = `${items.length}件を選択中です。まとめて挿入できます。`;
}

function renderTabs() {
  const baseTabs = BASE_TAB_ORDER.map((tab) => `
    <button
      class="tab-button ${state.activeTab === tab ? "is-active" : ""}"
      data-action="select-tab"
      data-tab="${tab}"
      type="button"
    >
      ${escapeHtml(getTabLabel(tab))}
    </button>
  `);

  const favoriteTabs = state.favoriteTabs.map((favoriteTab) => {
    const favoriteTabKey = getFavoriteTabKey(favoriteTab.id);
    return `
      <button
        class="tab-button ${state.activeTab === favoriteTabKey ? "is-active" : ""}"
        data-action="select-tab"
        data-tab="${favoriteTabKey}"
        type="button"
      >
        ${escapeHtml(favoriteTab.label)}
      </button>
    `;
  });

  dom.tabRow.innerHTML = `
    ${baseTabs.join("")}
    ${favoriteTabs.join("")}
    <button class="tab-add-button" data-action="add-favorite-tab" type="button" aria-label="お気に入りタブを追加">＋</button>
  `;
}

function renderFavoriteDialog() {
  if (!state.favoriteDialogOpen) {
    return;
  }

  const item = findItemById(state.favoriteDialogItemId);
  if (!item) {
    closeFavoriteDialog();
    return;
  }

  dom.favoriteDialogDescription.textContent = `「${item.name}」を登録するお気に入りタブを選択してください。`;
  dom.favoriteTabChecklist.innerHTML = state.favoriteTabs.map((favoriteTab) => `
    <label class="favorite-tab-option">
      <input
        type="checkbox"
        data-favorite-tab-id="${favoriteTab.id}"
        ${item.favoriteTabIds.includes(favoriteTab.id) ? "checked" : ""}
      >
      <span>${escapeHtml(favoriteTab.label)}</span>
    </label>
  `).join("");
  dom.saveFavoriteDialogButton.textContent = item.favorite ? "更新する" : "登録する";
}

function renderObjectPreviewForDialog() {
  if (!state.pendingObjectSource) {
    dom.objectPreview.classList.add("is-empty");
    dom.objectPreview.textContent = "まだオブジェクトが選択されていません";
    dom.objectPickStatus.textContent = "追加したいオブジェクトを、現在のスライド上から選択してください。";
    return;
  }

  dom.objectPreview.classList.remove("is-empty");
  dom.objectPreview.innerHTML = renderPreviewMarkup(state.pendingObjectSource.preview);
  dom.objectPickStatus.textContent = `選択中: ${state.pendingObjectSource.name}`;
}

function render() {
  renderTabs();
  renderToolbarState();
  renderCards();
  renderFooterState();
  renderSlideItems();
  renderFavoriteDialog();
}

function handleTabRowClick(event) {
  const addButton = event.target.closest("[data-action='add-favorite-tab']");
  if (addButton) {
    addFavoriteTab();
    return;
  }

  const tabButton = event.target.closest("[data-action='select-tab']");
  if (tabButton) {
    setActiveTab(tabButton.dataset.tab);
  }
}

function handleGridClick(event) {
  const selectButton = event.target.closest("[data-action='select-card']");
  if (selectButton) {
    event.stopPropagation();
    toggleCardSelection(selectButton.dataset.id);
    return;
  }

  const favoriteButton = event.target.closest("[data-action='favorite']");
  if (favoriteButton) {
    event.stopPropagation();
    openFavoriteDialog(favoriteButton.dataset.id);
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete']");
  if (deleteButton) {
    event.stopPropagation();
    deleteUserItem(deleteButton.dataset.id);
    return;
  }
}

function handleSelectionDetailsClick(event) {
  const editButton = event.target.closest("[data-action='edit-selected']");
  if (editButton) {
    startInlineNameEdit(editButton.dataset.id);
    return;
  }

  const saveButton = event.target.closest("[data-action='save-name-edit']");
  if (saveButton) {
    commitInlineNameEdit();
    return;
  }

  const cancelButton = event.target.closest("[data-action='cancel-name-edit']");
  if (cancelButton) {
    cancelInlineNameEdit();
  }
}

function handleSelectionDetailsInput(event) {
  if (event.target.matches("[data-role='name-edit-input']")) {
    updateInlineNameDraft(event.target.value);
  }
}

function handleSelectionDetailsKeydown(event) {
  if (!event.target.matches("[data-role='name-edit-input']")) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    commitInlineNameEdit();
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    cancelInlineNameEdit();
  }
}

function handleImageFileChange(event) {
  hideFormError();
  const [file] = event.target.files || [];
  if (!file) {
    state.pendingUpload = null;
    dom.imagePreview.classList.add("is-empty");
    dom.imagePreview.textContent = "画像を選択してください";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    state.pendingUpload = {
      src: reader.result,
      fileName: file.name,
      mimeType: file.type || "image/*"
    };
    dom.imagePreview.classList.remove("is-empty");
    dom.imagePreview.innerHTML = `<img src="${reader.result}" alt="">`;
  };
  reader.readAsDataURL(file);
}

function handleSlideObjectClick(event) {
  if (!state.objectPickMode) {
    return;
  }

  const slideObject = event.target.closest("[data-slide-item-id]");
  if (!slideObject) {
    return;
  }

  if (slideObject.dataset.slideItemType !== "editableObject") {
    return;
  }

  selectSlideObjectForUserAdd(slideObject.dataset.slideItemId);
}

function bindEvents() {
  dom.openModalButton.addEventListener("click", openModal);
  dom.closeModalButton.addEventListener("click", closeModal);
  dom.cancelButton.addEventListener("click", closeModal);
  dom.addUserItemButton.addEventListener("click", openAddDialog);
  dom.renameFavoriteTabButton.addEventListener("click", renameActiveFavoriteTab);
  dom.closeAddDialogButton.addEventListener("click", closeAddDialog);
  dom.cancelAddDialogButton.addEventListener("click", closeAddDialog);
  dom.closeFavoriteDialogButton.addEventListener("click", closeFavoriteDialog);
  dom.cancelFavoriteDialogButton.addEventListener("click", closeFavoriteDialog);
  dom.saveFavoriteDialogButton.addEventListener("click", saveFavoriteDialog);

  dom.tabRow.addEventListener("click", handleTabRowClick);
  dom.searchInput.addEventListener("input", (event) => setSearchQuery(event.target.value));
  dom.insertButton.addEventListener("click", insertSelectedItem);
  dom.cardGrid.addEventListener("click", handleGridClick);
  dom.modalWindow.addEventListener("pointermove", handleModalWindowPointerMove);
  dom.modalWindow.addEventListener("pointerleave", handleModalWindowPointerLeave);
  dom.modalWindow.addEventListener("pointerdown", handleModalWindowPointerDown);
  dom.modalHeader.addEventListener("pointerdown", (event) => {
    if (getModalResizeDirection(event)) {
      return;
    }
    beginModalInteraction("drag", event);
  });
  dom.modalResizeHandle.addEventListener("pointerdown", (event) => beginModalInteraction("resize", event, "bottom-right"));
  dom.itemTypeSelect.addEventListener("change", updateAddDialogType);
  dom.imageFileInput.addEventListener("change", handleImageFileChange);
  dom.pickSlideObjectButton.addEventListener("click", startObjectPickMode);
  dom.slideObjectLayer.addEventListener("click", handleSlideObjectClick);
  window.addEventListener("resize", handleWindowResize);

  dom.addItemForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideFormError();
    const item = createUserItemFromForm();
    if (item) {
      addUserItem(item);
    }
  });

  dom.modalOverlay.addEventListener("click", (event) => {
    if (event.target === dom.modalOverlay) {
      closeModal();
    }
  });

  dom.addDialogOverlay.addEventListener("click", (event) => {
    if (event.target === dom.addDialogOverlay) {
      closeAddDialog();
    }
  });

  dom.favoriteDialogOverlay.addEventListener("click", (event) => {
    if (event.target === dom.favoriteDialogOverlay) {
      closeFavoriteDialog();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.favoriteDialogOpen) {
      closeFavoriteDialog();
      return;
    }
    if (event.key === "Escape" && state.objectPickMode) {
      stopObjectPickMode(true);
      return;
    }
    if (event.key === "Escape" && state.addDialogOpen) {
      closeAddDialog();
      return;
    }
    if (event.key === "Escape" && state.modalOpen) {
      closeModal();
    }
  });
}

function init() {
  setOverlayVisibility(dom.modalOverlay, false);
  setOverlayVisibility(dom.addDialogOverlay, false);
  setOverlayVisibility(dom.favoriteDialogOverlay, false);
  bindEvents();
  renderObjectPreviewForDialog();
  render();
}

init();
