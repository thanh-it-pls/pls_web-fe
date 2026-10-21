import { cardsApi, contentsApi, sectionsApi } from "@/lib/api/resources";
import { ContentType, SectionType, type ContentTypeValue, type SectionTypeValue } from "@/lib/api/types";
import type { SectionTree } from "@/lib/site/types";

export type TemplateKey =
  | "hero"
  | "partners"
  | "story"
  | "values"
  | "stats"
  | "gallery"
  | "goals"
  | "principles"
  | "timeline"
  | "tech"
  | "generic";

interface ContentSeed {
  type: ContentTypeValue;
  title: string;
  subtitle?: string;
  des?: string;
  link?: string;
  img?: string;
}

interface CardSeed {
  title: string;
  subtitle?: string;
  des?: string;
  link?: string;
  img?: string;
  contents?: ContentSeed[];
}

interface SectionSeed {
  title?: string;
  des?: string;
  cards: CardSeed[];
}

export interface Template {
  key: TemplateKey;
  label: string;
  description: string;
  sectionType: SectionTypeValue;
  build: () => SectionSeed;
  /** Adds one more repeatable item (card or content) to an existing section of this template. */
  addItem?: { label: string; run: (section: SectionTree) => Promise<unknown> };
}

/** Layout is chosen by the code prefix, so codes can stay auto-generated: `values-k3j9x2`. */
export const templateKeyOf = (code: string): TemplateKey => {
  const prefix = code.split("-")[0] as TemplateKey;
  return prefix in TEMPLATES ? prefix : "generic";
};

const rand = (): string => Math.random().toString(36).slice(2, 10);

const createCard = async (sectionId: string, prefix: string, card: CardSeed): Promise<void> => {
  const created = await cardsApi.create({
    title: card.title,
    parent: sectionId,
    code: `${prefix}-card-${rand()}`,
    subtitle: card.subtitle ?? null,
    des: card.des ?? null,
    link: card.link ?? null,
    img: card.img ?? null,
    status: 1,
  });
  // Sequential so the API's append-to-end ordering matches the design order.
  for (const ct of card.contents ?? []) await createContent(created.id, prefix, ct);
};

const createContent = (cardId: string, prefix: string, ct: ContentSeed): Promise<unknown> =>
  contentsApi.create({
    type: ct.type,
    title: ct.title,
    parent: cardId,
    code: `${prefix}-c-${rand()}`,
    subtitle: ct.subtitle ?? null,
    des: ct.des ?? null,
    link: ct.link ?? null,
    img: ct.img ?? null,
    status: 1,
  });

const addCard = (seed: CardSeed, prefix: string) => (section: SectionTree) => createCard(section.id, prefix, seed);

const addContentToFirstCard = (seed: ContentSeed, prefix: string) => async (section: SectionTree) => {
  const card = section.cards[0];
  if (card) await createContent(card.id, prefix, seed);
};

const LOREM = "PORO luôn sát cánh cùng học viên trên mọi chặng đường, tạo động lực để bạn đạt mục tiêu nhanh";
const STAGE_DES =
  "PORO LANGUAGE SPACE đã phát triển mạnh mẽ với đội ngũ giảng viên giàu kinh nghiệm và chương trình học tiên tiến, ứng dụng công nghệ hiện đại vào giảng dạy. Trung tâm không chỉ thu hút một lượng học viên lớn mà còn tạo dựng được uy tín vững chắc, cung cấp môi trường học tập sáng tạo, hiệu quả.";
const BUTTON: ContentSeed = { type: ContentType.BUTTON, title: "Ứng tuyển ngay", link: "#" };

export const TEMPLATES: Record<TemplateKey, Template> = {
  hero: {
    key: "hero",
    label: "Hero (nền + ảnh ghép)",
    description: "Nền đỏ, 4 ảnh ghép bên trái, tiêu đề, mô tả, nút và dòng chữ dưới.",
    sectionType: SectionType.BACKGROUND,
    build: () => ({
      title: "Hero",
      cards: [
        {
          title: "YOU'LL NEVER WALK ALONE",
          subtitle: "TẠI PORO LANGUAGE SPACE - TRI THỨC TRUYỀN TỪ TÂM",
          des: "Cơ hội nghề nghiệp về ngôn ngữ mở rộng tiềm năng của bạn. Cùng PORO, kiến tạo tương lai cho hàng triệu học viên, chinh phục tri thức toàn cầu và phát triển sự nghiệp một cách bền vững",
          contents: [
            ...[1, 2, 3, 4].map((n) => ({ type: ContentType.IMAGE, title: `Ảnh ${n}` })),
            BUTTON,
          ],
        },
      ],
    }),
    addItem: { label: "Thêm ảnh", run: addContentToFirstCard({ type: ContentType.IMAGE, title: "Ảnh mới" }, "hero") },
  },
  partners: {
    key: "partners",
    label: "Logo đối tác",
    description: "Dải logo các thương hiệu / trung tâm chạy ngang.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "Đối tác",
      cards: [
        {
          title: "Đối tác",
          contents: [
            "Betreux Deutsch",
            "Creative English",
            "Hàn ngữ Saechang",
            "Đắc Nhân",
            "Créatis Français",
            "Nhật ngữ Sakumi",
          ].map((title) => ({ type: ContentType.IMAGE, title })),
        },
      ],
    }),
    addItem: { label: "Thêm logo", run: addContentToFirstCard({ type: ContentType.IMAGE, title: "Logo mới" }, "partners") },
  },
  story: {
    key: "story",
    label: "Câu chuyện (ảnh + thẻ chữ)",
    description: "Ảnh lớn bên trái, thẻ trắng bên phải có tiêu đề, mô tả và nút.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "Câu chuyện",
      cards: [
        {
          title: "CÂU CHUYỆN CỦA",
          subtitle: "PORO LANGUAGE SPACE",
          des: "Chúng tôi truyền cảm hứng học ngôn ngữ bằng niềm đam mê sâu sắc, không ngừng tìm kiếm cơ hội để kết nối và khám phá. Mục tiêu không chỉ là mang đến bài học chất lượng, mà còn tạo ra trải nghiệm học tập ý nghĩa. Tại PLS Language Daily, chúng tôi xây dựng cộng đồng vững mạnh, nơi mỗi thành viên tìm thấy niềm vui, sự hỗ trợ và động lực – cùng nhau chinh phục ngôn ngữ và kết nối toàn cầu.",
          contents: [BUTTON],
        },
      ],
    }),
  },
  values: {
    key: "values",
    label: "Giá trị cốt lõi (4 thẻ)",
    description: "Tiêu đề giữa và lưới thẻ đỏ có hình minh hoạ.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "GIÁ TRỊ CỐT LÕI",
      des: "Truyền Cảm Hứng Học Tập Và Phát Triển Ngôn Ngữ Bằng Công Nghệ Hiện Đại Cùng PORO",
      cards: ["Sáng Tạo", "Tận Tâm", "Tiện Lợi", "Đổi Mới"].map((title) => ({ title, des: LOREM })),
    }),
    addItem: { label: "Thêm thẻ", run: addCard({ title: "Giá trị mới", des: LOREM }, "values") },
  },
  stats: {
    key: "stats",
    label: "Số liệu + thông điệp",
    description: "Thông điệp bên trái, 4 ô số liệu bên phải.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "Số liệu",
      cards: [
        {
          subtitle: "TẠI PORO LANGUAGE SPACE",
          title: "Tri thức truyền từ tâm",
          des: "Tại PORO, chúng tôi tin rằng: dạy giỏi là chưa đủ, mà cần dạy bằng cả tấm lòng. Với phương châm “Tri thức truyền từ tâm”, giảng viên không chỉ truyền đạt kiến thức mà còn đồng hành, truyền cảm hứng và tạo động lực cho học viên.\nMỗi khóa học được thiết kế thực tế, dễ hiểu – dễ áp dụng, giúp học viên tiến bộ vững chắc mỗi ngày. Đối với chúng tôi, thành công không chỉ nằm ở kết quả, mà còn ở hành trình học tập đầy ý nghĩa và kết nối.",
          contents: [
            { type: ContentType.ITEM, title: "LỚP HỌC ĐÃ MỞ", subtitle: "500+" },
            { type: ContentType.ITEM, title: "HỌC VIÊN ĐÃ HỌC", subtitle: "5000+" },
            { type: ContentType.ITEM, title: "GIÁO VIÊN TÀI NĂNG", subtitle: "100" },
            { type: ContentType.ITEM, title: "TỈ LỆ HÀI LÒNG", subtitle: "98%" },
          ],
        },
      ],
    }),
    addItem: {
      label: "Thêm số liệu",
      run: addContentToFirstCard({ type: ContentType.ITEM, title: "CHỈ SỐ MỚI", subtitle: "0" }, "stats"),
    },
  },
  gallery: {
    key: "gallery",
    label: "Trải nghiệm (slider ảnh)",
    description: "Slider ảnh lớn có ảnh hai bên mờ và chấm điều hướng.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "TRẢI NGHIỆM TẠI PORO",
      des: "Làm Hết Sức, Chơi Hết Mình",
      cards: [1, 2, 3, 4].map((n) => ({ title: `Hoạt động ${n}` })),
    }),
    addItem: { label: "Thêm ảnh", run: addCard({ title: "Hoạt động mới" }, "gallery") },
  },
  goals: {
    key: "goals",
    label: "Mục tiêu (3 thẻ trắng)",
    description: "Lưới thẻ trắng có icon, tiêu đề đỏ và mô tả.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "MỤC TIÊU THÀNH LẬP",
      des: "Chất Lượng, Linh Hoạt Và Đồng Hành Cùng Học Viên Trên Mọi Hành Trình Chinh Phục Ngoại Ngữ.",
      cards: ["Chất lượng", "Sáng tạo", "Khách hàng"].map((title) => ({
        title,
        des: "Đảm bảo chất lượng giảng dạy và dịch vụ khách hàng",
      })),
    }),
    addItem: { label: "Thêm thẻ", run: addCard({ title: "Mục tiêu mới", des: "Mô tả" }, "goals") },
  },
  principles: {
    key: "principles",
    label: "Phương châm (6 mục quanh logo)",
    description: "Logo ở giữa, 6 phương châm đánh số hai bên.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "PHƯƠNG CHÂM CỦA PORO",
      des: "Sáu Phương Châm Giảng Dạy Là Kim Chỉ Nam, Định Hướng Xuyên Suốt Trong Quá Trình Giảng Dạy Của Trung Tâm.",
      cards: [
        {
          title: "Logo trung tâm",
          contents: [
            ["Nhiệt Huyết", "Nhiệt huyết luôn là động lực mạnh mẽ. Khi chúng ta đam mê và hết lòng với một điều gì"],
            ["Nhiệt Tâm", "Nhiệt tâm là yếu tố tạo nên sức mạnh. Khi mỗi học viên mang trong mình sự đam mê và nhiệt huyết."],
            ["Học Viên", "Học viên chính là động lực mạnh mẽ. Khi học viên đam mê và nỗ lực hết mình, trung tâm sẽ luôn đồng hành."],
            ["Sáng Tạo", "Sáng tạo là nguồn động lực mạnh mẽ. Khi mỗi học viên được khuyến khích phát huy sự sáng tạo."],
            ["Thú Vị", "Thú vị chính là yếu tố tạo nên sức sống. Khi mỗi bài học trở nên hấp dẫn và đầy thử thách, trung tâm luôn đồng hành cùng học viên."],
            ["Công Nghệ", "Công nghệ là yếu tố tiên phong. Khi mỗi học viên được hỗ trợ bởi các công cụ công nghệ hiện đại, trung tâm luôn đồng hành."],
          ].map(([title, des]) => ({ type: ContentType.ITEM, title, des })),
        },
      ],
    }),
    addItem: {
      label: "Thêm phương châm",
      run: addContentToFirstCard({ type: ContentType.ITEM, title: "Phương châm mới", des: "Mô tả" }, "principles"),
    },
  },
  timeline: {
    key: "timeline",
    label: "Giai đoạn hình thành (timeline)",
    description: "Trục dọc, các giai đoạn xen kẽ chữ và hình toà nhà.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "GIAI ĐOẠN HÌNH THÀNH",
      des: "Những Viên Gạch Đầu Tiên Tạo Nên Poro Language Space",
      cards: ["Giai đoạn sơ khai", "Giai đoạn hình thành", "Giai đoạn hiện tại", "Giai đoạn phát triển"].map(
        (title) => ({ title, des: STAGE_DES }),
      ),
    }),
    addItem: { label: "Thêm giai đoạn", run: addCard({ title: "Giai đoạn mới", des: STAGE_DES }, "timeline") },
  },
  tech: {
    key: "tech",
    label: "Công nghệ (slider giới thiệu)",
    description: "Slider thẻ trắng: ảnh bên trái, tên sản phẩm, mô tả và nút.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "CÔNG NGHỆ MẠNH MẼ",
      des: "PORO Tiên Phong Ứng Dụng Công Nghệ Vào Giảng Dạy Và Quản Lý Chất Lượng Nhằm Mang Lại Hành Trình Học Hiệu Quả, Thông Minh Và Linh Hoạt Nhất Cho Học Viên.",
      cards: [
        {
          title: "BUDDY",
          subtitle: "Nền tảng kết nối & quản lý partner của PORO",
          des: "Buddy là hệ thống nội bộ được xây dựng nhằm hỗ trợ quá trình phân việc, quản lý hồ sơ và theo dõi hiệu suất làm việc của cộng tác viên PORO. Nền tảng giúp tối ưu hóa quy trình tuyển chọn, đánh giá và vận hành, đảm bảo tính chuyên nghiệp – minh bạch – đồng bộ trong mọi khâu hoạt động.",
          contents: [BUTTON],
        },
        { title: "Sản phẩm mới", subtitle: "Tiêu đề phụ", des: "Mô tả sản phẩm", contents: [BUTTON] },
      ],
    }),
    addItem: {
      label: "Thêm slide",
      run: addCard({ title: "Sản phẩm mới", subtitle: "Tiêu đề phụ", des: "Mô tả sản phẩm", contents: [BUTTON] }, "tech"),
    },
  },
  generic: {
    key: "generic",
    label: "Trống (lưới thẻ)",
    description: "Section trống: tiêu đề + lưới card, tự bố trí.",
    sectionType: SectionType.CONTENT,
    build: () => ({ title: "Section mới", cards: [] }),
    addItem: { label: "Thêm card", run: addCard({ title: "Card mới", des: "Mô tả" }, "generic") },
  },
};

/** Order of the sections in the "Về chúng tôi" Figma page. */
export const ABOUT_PAGE_ORDER: TemplateKey[] = [
  "hero",
  "partners",
  "story",
  "values",
  "stats",
  "gallery",
  "goals",
  "principles",
  "timeline",
  "tech",
];

/** Create one section (with its default cards/contents) from a template, enabled so it shows immediately. */
export const createSectionFromTemplate = async (key: TemplateKey, pageId: string): Promise<void> => {
  const template = TEMPLATES[key];
  const seed = template.build();
  const section = await sectionsApi.create({
    code: `${key}-${rand()}`,
    parent_id: pageId,
    type: template.sectionType,
    title: seed.title ?? null,
    des: seed.des ?? null,
    status: 1,
  });
  for (const card of seed.cards) await createCard(section.id, key, card);
};
