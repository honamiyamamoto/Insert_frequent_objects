const TAB_CONFIG = {
  images: { label: "画像" },
  objects: { label: "頻出オブジェクト" },
  favorites: { label: "お気に入り" },
  user: { label: "ユーザー追加" }
};

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
  closeModalButton: document.getElementById("closeModalButton"),
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  searchInput: document.getElementById("searchInput"),
  cardGrid: document.getElementById("cardGrid"),
  emptyState: document.getElementById("emptyState"),
  itemCount: document.getElementById("itemCount"),
  selectionDetails: document.getElementById("selectionDetails"),
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
  templateSelect: document.getElementById("templateSelect"),
  imagePreview: document.getElementById("imagePreview"),
  objectPreview: document.getElementById("objectPreview"),
  formError: document.getElementById("formError")
};

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
  return {
    id: config.id,
    name: config.name,
    type: "image",
    favorite: Boolean(config.favorite),
    sourceTab: config.sourceTab,
    source: config.sourceTab,
    preview: {
      mode: "image",
      src: config.imageSrc,
      kind: config.imageKind
    },
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
  return {
    id: config.id,
    name: config.name,
    type: "editableObject",
    favorite: Boolean(config.favorite),
    sourceTab: config.sourceTab,
    source: config.sourceTab,
    preview: {
      mode: "svg",
      svgMarkup: config.svgMarkup,
      templateType: config.templateType
    },
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
    keywords: [base.label, text, sourceTab === "user" ? "ユーザー追加" : "頻出オブジェクト"]
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
  selectedItemId: null,
  modalOpen: false,
  addDialogOpen: false,
  nextUserId: 4,
  pendingUpload: null,
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
  if (tab === "favorites") {
    return getAllItems().filter((item) => item.favorite);
  }
  if (tab === "images") {
    return state.collections.images;
  }
  if (tab === "objects") {
    return state.collections.objects;
  }
  return [
    ...state.collections.user.images,
    ...state.collections.user.editableObjects
  ];
}

function getFilteredItems() {
  const query = state.searchQuery.trim().toLowerCase();
  const items = getItemsForTab(state.activeTab);
  if (!query) {
    return items;
  }
  return items.filter((item) => item.searchableText.includes(query));
}

function setActiveTab(tab) {
  state.activeTab = tab;
  state.searchQuery = "";
  state.selectedItemId = null;
  dom.searchInput.value = "";
  render();
}

function setSearchQuery(value) {
  state.searchQuery = value;
  state.selectedItemId = null;
  render();
}

function setSelectedItem(itemId) {
  state.selectedItemId = itemId;
  render();
}

function toggleFavorite(itemId) {
  const item = findItemById(itemId);
  if (!item) {
    return;
  }
  item.favorite = !item.favorite;
  if (state.activeTab === "favorites" && state.selectedItemId === itemId && !item.favorite) {
    state.selectedItemId = null;
  }
  render();
}

function deleteUserItem(itemId) {
  state.collections.user.images = state.collections.user.images.filter((item) => item.id !== itemId);
  state.collections.user.editableObjects = state.collections.user.editableObjects.filter((item) => item.id !== itemId);
  if (state.selectedItemId === itemId) {
    state.selectedItemId = null;
  }
  render();
}

function openModal() {
  state.modalOpen = true;
  dom.modalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  render();
}

function closeModal() {
  state.modalOpen = false;
  state.selectedItemId = null;
  state.searchQuery = "";
  dom.searchInput.value = "";
  dom.modalOverlay.hidden = true;
  closeAddDialog();
  document.body.style.overflow = "";
}

function openAddDialog() {
  state.addDialogOpen = true;
  dom.addDialogOverlay.hidden = false;
  resetAddDialog();
  updateAddDialogType();
}

function closeAddDialog() {
  state.addDialogOpen = false;
  dom.addDialogOverlay.hidden = true;
}

function resetAddDialog() {
  dom.addItemForm.reset();
  state.pendingUpload = null;
  hideFormError();
  dom.imagePreview.classList.add("is-empty");
  dom.imagePreview.textContent = "画像を選択してください";
  dom.objectPreview.innerHTML = renderPreviewMarkup({
    mode: "svg",
    svgMarkup: createObjectSvg(dom.templateSelect.value)
  });
}

function updateAddDialogType() {
  const isImage = dom.itemTypeSelect.value === "image";
  dom.imageFields.hidden = !isImage;
  dom.objectFields.hidden = isImage;
  hideFormError();
}

function showFormError(message) {
  dom.formError.hidden = false;
  dom.formError.textContent = message;
}

function hideFormError() {
  dom.formError.hidden = true;
  dom.formError.textContent = "";
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
      keywords: ["ユーザー追加", name]
    });
  }

  const templateType = dom.templateSelect.value;
  const template = OBJECT_TEMPLATE_DEFS[templateType];
  const svgMarkup = createObjectSvg(templateType, { text: template.text });

  return createEditableItem({
    id: `user-${String(state.nextUserId).padStart(2, "0")}`,
    name,
    sourceTab: "user",
    templateType,
    svgMarkup,
    objectDefinition: {
      shapeKind: template.shapeKind,
      templateType,
      elementCount: countSvgElements(svgMarkup),
      layoutHint: `${template.label}テンプレート`
    },
    editableProps: {
      fillColor: template.fillColor,
      strokeColor: template.strokeColor,
      text: template.text
    },
    keywords: ["ユーザー追加", template.label, name]
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
  state.selectedItemId = item.id;
  render();
}

function buildInsertPayload(item) {
  const payload = {
    id: item.id,
    name: item.name,
    sourceTab: item.sourceTab,
    type: item.type,
    favorite: item.favorite,
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

function insertSelectedItem() {
  const item = findItemById(state.selectedItemId);
  if (!item) {
    return;
  }
  const payload = buildInsertPayload(item);
  console.log("Insert mock payload:", payload);
  dom.statusMessage.textContent = `「${item.name}」の情報を console に出力しました。`;
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
  const typeLabel = item.type === "image" ? "画像" : "編集可能オブジェクト";
  const isSelected = item.id === state.selectedItemId;
  const favoriteClass = item.favorite ? "favorite-button is-active" : "favorite-button";
  const deleteButton = state.activeTab === "user"
    ? `<button class="delete-button" data-action="delete" data-id="${item.id}" type="button" aria-label="削除">削</button>`
    : "";

  return `
    <article class="asset-card ${isSelected ? "is-selected" : ""}" data-id="${item.id}" tabindex="0">
      <div class="card-actions">
        <button class="${favoriteClass}" data-action="favorite" data-id="${item.id}" type="button" aria-label="お気に入り">★</button>
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
  dom.addUserItemButton.hidden = state.activeTab !== "user";

  if (items.length === 0) {
    dom.cardGrid.innerHTML = "";
    dom.emptyState.hidden = false;
    dom.emptyState.textContent = state.activeTab === "favorites" && !state.searchQuery
      ? "お気に入りがありません"
      : "該当する項目がありません";
    return;
  }

  dom.emptyState.hidden = true;
  dom.cardGrid.innerHTML = items.map(renderCard).join("");
}

function renderSelectionDetails() {
  const item = findItemById(state.selectedItemId);
  if (!item) {
    dom.selectionDetails.innerHTML = `
      <p class="detail-placeholder">未選択です。カードを選ぶとここに概要が表示されます。</p>
    `;
    return;
  }

  const typeLabel = item.type === "image" ? "画像" : "編集可能オブジェクト";
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
    <h3 class="detail-title">${escapeHtml(item.name)}</h3>
    <div class="detail-list">
      <div class="detail-row">
        <span>種別</span>
        <strong>${typeLabel}</strong>
      </div>
      <div class="detail-row">
        <span>sourceTab</span>
        <strong>${TAB_CONFIG[item.sourceTab].label}</strong>
      </div>
      <div class="detail-row">
        <span>お気に入り</span>
        <strong>${item.favorite ? "登録済み" : "未登録"}</strong>
      </div>
      ${summaryMarkup}
    </div>
  `;
}

function renderFooterState() {
  const item = findItemById(state.selectedItemId);
  dom.insertButton.disabled = !item;
  if (!item) {
    dom.statusMessage.textContent = "項目を選択すると「挿入」が有効になります。";
    return;
  }
  dom.statusMessage.textContent = `選択中: ${item.name} / ${item.type === "image" ? "画像" : "編集可能オブジェクト"}`;
}

function renderTabs() {
  dom.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.activeTab);
  });
}

function renderObjectPreviewForDialog() {
  dom.objectPreview.classList.remove("is-empty");
  dom.objectPreview.innerHTML = renderPreviewMarkup({
    mode: "svg",
    svgMarkup: createObjectSvg(dom.templateSelect.value)
  });
}

function render() {
  renderTabs();
  renderCards();
  renderSelectionDetails();
  renderFooterState();
}

function handleGridClick(event) {
  const favoriteButton = event.target.closest("[data-action='favorite']");
  if (favoriteButton) {
    event.stopPropagation();
    toggleFavorite(favoriteButton.dataset.id);
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete']");
  if (deleteButton) {
    event.stopPropagation();
    deleteUserItem(deleteButton.dataset.id);
    return;
  }

  const card = event.target.closest(".asset-card");
  if (card) {
    setSelectedItem(card.dataset.id);
  }
}

function handleGridKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  const card = event.target.closest(".asset-card");
  if (!card) {
    return;
  }
  event.preventDefault();
  setSelectedItem(card.dataset.id);
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

function bindEvents() {
  dom.openModalButton.addEventListener("click", openModal);
  dom.closeModalButton.addEventListener("click", closeModal);
  dom.cancelButton.addEventListener("click", closeModal);
  dom.addUserItemButton.addEventListener("click", openAddDialog);
  dom.closeAddDialogButton.addEventListener("click", closeAddDialog);
  dom.cancelAddDialogButton.addEventListener("click", closeAddDialog);

  dom.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  dom.searchInput.addEventListener("input", (event) => setSearchQuery(event.target.value));
  dom.insertButton.addEventListener("click", insertSelectedItem);
  dom.cardGrid.addEventListener("click", handleGridClick);
  dom.cardGrid.addEventListener("keydown", handleGridKeydown);
  dom.itemTypeSelect.addEventListener("change", updateAddDialogType);
  dom.templateSelect.addEventListener("change", renderObjectPreviewForDialog);
  dom.imageFileInput.addEventListener("change", handleImageFileChange);

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

  document.addEventListener("keydown", (event) => {
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
  bindEvents();
  renderObjectPreviewForDialog();
  render();
}

init();
