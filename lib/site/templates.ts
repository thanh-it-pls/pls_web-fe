import { cardsApi, contentsApi, sectionsApi } from "@/lib/api/resources";
import { ContentType, SectionType, type ContentTypeValue, type SectionTypeValue } from "@/lib/api/types";
import type { SectionTree } from "@/lib/site/types";

/** Blocks are built per page and never shared: `about_*` for "Về chúng tôi", `home_*` for "Trang chủ". */
export type TemplateKey =
  | "about_hero"
  | "about_partners"
  | "about_story"
  | "about_values"
  | "about_stats"
  | "about_gallery"
  | "about_goals"
  | "about_principles"
  | "about_timeline"
  | "about_tech"
  | "home_hero"
  | "home_partners"
  | "home_centers"
  | "home_why"
  | "home_ecosystem"
  | "home_journey"
  | "home_products"
  | "generic";

export type TemplatePage = "about" | "home" | "any";

export const pageOfTemplate = (key: TemplateKey): TemplatePage =>
  key.startsWith("about_") ? "about" : key.startsWith("home_") ? "home" : "any";

/** Codes created before blocks were split per page. */
const LEGACY_KEYS: Record<string, TemplateKey> = {
  hero: "about_hero",
  partners: "about_partners",
  story: "about_story",
  values: "about_values",
  stats: "about_stats",
  gallery: "about_gallery",
  goals: "about_goals",
  principles: "about_principles",
  timeline: "about_timeline",
  tech: "about_tech",
  centers: "home_centers",
};

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

/** Layout is chosen by the code prefix, so codes can stay auto-generated: `home_hero-k3j9x2`. */
export const templateKeyOf = (code: string): TemplateKey => {
  const prefix = code.split("-")[0];
  if (prefix in TEMPLATES) return prefix as TemplateKey;
  return LEGACY_KEYS[prefix] ?? "generic";
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

const centerCard = (title: string, des: string): CardSeed => ({
  title,
  des,
  contents: [
    { type: ContentType.IMAGE, title: "Logo trung tâm" },
    { type: ContentType.ITEM, title: "Khóa học chuyên giao tiếp 1:1" },
    { type: ContentType.ITEM, title: "Khóa học theo cấp độ A1, A2, B1, B2, C1, C2..." },
    { type: ContentType.ITEM, title: "Khóa học luyện thi giao tiếp" },
    { type: ContentType.BUTTON, title: "Tìm hiểu thêm", link: "#" },
    { type: ContentType.SOCIAL, title: "Facebook", link: "#" },
    { type: ContentType.SOCIAL, title: "TikTok", link: "#" },
    { type: ContentType.SOCIAL, title: "YouTube", link: "#" },
  ],
});

const STORES: ContentSeed[] = [
  { type: ContentType.DOWNLOAD, title: "App Store", link: "#" },
  { type: ContentType.DOWNLOAD, title: "Google Play", link: "#" },
];

const ecosystemCard = (title: string, subtitle: string, des: string): CardSeed => ({
  title,
  subtitle,
  des,
  contents: [
    { type: ContentType.CONTENT, title: "Ứng Dụng Học Tiếng Nhật Khác Của\nPORO LANGUAGE SPACE" },
    ...[1, 2, 3, 4].map((n) => ({ type: ContentType.IMAGE, title: `Ứng dụng ${n}` })),
    { type: ContentType.CONTENT, title: "Tải Ứng Dụng Tại Đây" },
    ...STORES,
  ],
});

const productCard = (title: string): CardSeed => ({
  title,
  contents: [
    { type: ContentType.ITEM, title: "Hơn 6000 từ vựng thông dụng" },
    { type: ContentType.ITEM, title: "10 chủ đề cùng 145 bài học" },
    { type: ContentType.ITEM, title: "Đầy đủ các cấp độ" },
    { type: ContentType.RATING, title: "4.8", subtitle: "21.1k reviews" },
    // DOWNLOAD without image/link = download count; with link = store badge.
    { type: ContentType.DOWNLOAD, title: "1 Tr" },
    ...STORES,
  ],
});

export const TEMPLATES: Record<TemplateKey, Template> = {
  about_hero: {
    key: "about_hero",
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
    addItem: { label: "Thêm ảnh", run: addContentToFirstCard({ type: ContentType.IMAGE, title: "Ảnh mới" }, "about_hero") },
  },
  about_partners: {
    key: "about_partners",
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
    addItem: { label: "Thêm logo", run: addContentToFirstCard({ type: ContentType.IMAGE, title: "Logo mới" }, "about_partners") },
  },
  home_centers: {
    key: "home_centers",
    label: "Các trung tâm (slider)",
    description: "Slider thẻ trắng: ảnh + logo nổi, mô tả, bullet màu, nút Tìm hiểu thêm, icon mạng xã hội.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "CÁC TRUNG TÂM TRỰC THUỘC",
      des: "Trung Tâm Giáo Dục Đa Ngôn Ngữ",
      cards: [
        centerCard(
          "Học Tiếng Đức Trở Nên Dễ Dàng Tại Betreux Deutsch",
          "Trung tâm tiếng Betreux Deutsch là một trong những đơn vị đi đầu trong việc đào tạo tiếng Đức trực tuyến, nhằm có thể giúp cho tất cả mọi người dù đang ở đâu, bận rộn như thế nào vẫn có thể có cơ hội học tập và nâng cao trình độ giao tiếp tiếng Đức",
        ),
        centerCard("Trung tâm mới", "Mô tả trung tâm"),
      ],
    }),
    addItem: { label: "Thêm trung tâm", run: addCard(centerCard("Trung tâm mới", "Mô tả trung tâm"), "home_centers") },
  },
  about_story: {
    key: "about_story",
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
  about_values: {
    key: "about_values",
    label: "Giá trị cốt lõi (4 thẻ)",
    description: "Tiêu đề giữa và lưới thẻ đỏ có hình minh hoạ.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "GIÁ TRỊ CỐT LÕI",
      des: "Truyền Cảm Hứng Học Tập Và Phát Triển Ngôn Ngữ Bằng Công Nghệ Hiện Đại Cùng PORO",
      cards: ["Sáng Tạo", "Tận Tâm", "Tiện Lợi", "Đổi Mới"].map((title) => ({ title, des: LOREM })),
    }),
    addItem: { label: "Thêm thẻ", run: addCard({ title: "Giá trị mới", des: LOREM }, "about_values") },
  },
  about_stats: {
    key: "about_stats",
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
      run: addContentToFirstCard({ type: ContentType.ITEM, title: "CHỈ SỐ MỚI", subtitle: "0" }, "about_stats"),
    },
  },
  about_gallery: {
    key: "about_gallery",
    label: "Trải nghiệm (slider ảnh)",
    description: "Slider ảnh lớn có ảnh hai bên mờ và chấm điều hướng.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "TRẢI NGHIỆM TẠI PORO",
      des: "Làm Hết Sức, Chơi Hết Mình",
      cards: [1, 2, 3, 4].map((n) => ({ title: `Hoạt động ${n}` })),
    }),
    addItem: { label: "Thêm ảnh", run: addCard({ title: "Hoạt động mới" }, "about_gallery") },
  },
  about_goals: {
    key: "about_goals",
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
    addItem: { label: "Thêm thẻ", run: addCard({ title: "Mục tiêu mới", des: "Mô tả" }, "about_goals") },
  },
  about_principles: {
    key: "about_principles",
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
      run: addContentToFirstCard({ type: ContentType.ITEM, title: "Phương châm mới", des: "Mô tả" }, "about_principles"),
    },
  },
  about_timeline: {
    key: "about_timeline",
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
    addItem: { label: "Thêm giai đoạn", run: addCard({ title: "Giai đoạn mới", des: STAGE_DES }, "about_timeline") },
  },
  about_tech: {
    key: "about_tech",
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
      run: addCard({ title: "Sản phẩm mới", subtitle: "Tiêu đề phụ", des: "Mô tả sản phẩm", contents: [BUTTON] }, "about_tech"),
    },
  },
  home_hero: {
    key: "home_hero",
    label: "Trang chủ · Hero + số liệu",
    description: "Nền hồng với hình đỏ, 4 ảnh ghép bên trái, tiêu đề, 2 nút và 4 ô số liệu.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "Hero trang chủ",
      cards: [
        {
          subtitle: "Trung Tâm Giáo Dục Đa Ngôn Ngữ",
          title: "PORO LANGUAGE SPACE",
          des: "Hệ thống Poro Language Space là trung tâm đào tạo ngoại ngữ, cung cấp chương trình học các ngôn ngữ như tiếng Anh, Pháp, Đức, Trung, Nhật và Hàn. Đồng thời, chúng tôi phát triển các ứng dụng làm nền phục vụ nhiều học viên trong học ngoại ngữ.",
          contents: [
            ...[1, 2, 3, 4].map((n) => ({ type: ContentType.IMAGE, title: `Ảnh ${n}` })),
            { type: ContentType.BUTTON, title: "Về chúng tôi", link: "#" },
            { type: ContentType.BUTTON, title: "Ứng tuyển ngay", link: "#" },
            { type: ContentType.ITEM, title: "SỐ LỚP", subtitle: "200+" },
            { type: ContentType.ITEM, title: "SỐ LƯỢNG HV", subtitle: "3.500" },
            { type: ContentType.ITEM, title: "SỐ GIÁO VIÊN", subtitle: "350" },
            { type: ContentType.ITEM, title: "TỈ LỆ HÀI LÒNG", subtitle: "98%" },
          ],
        },
      ],
    }),
    addItem: { label: "Thêm ảnh", run: addContentToFirstCard({ type: ContentType.IMAGE, title: "Ảnh mới" }, "home_hero") },
  },
  home_partners: {
    key: "home_partners",
    label: "Trang chủ · Logo đối tác",
    description: "Dải logo ngăn cách bằng dấu ✦ vàng.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "Đối tác",
      cards: [
        {
          title: "Đối tác",
          contents: ["Betreux Deutsch", "Creative English", "Hàn ngữ Saechang", "Đắc Nhân", "Créatis Français", "Nhật ngữ Sakumi"].map(
            (title) => ({ type: ContentType.IMAGE, title }),
          ),
        },
      ],
    }),
    addItem: { label: "Thêm logo", run: addContentToFirstCard({ type: ContentType.IMAGE, title: "Logo mới" }, "home_partners") },
  },
  home_why: {
    key: "home_why",
    label: "Trang chủ · Tại sao nên chọn",
    description: "Ảnh bên trái, khối đỏ bên phải có tiêu đề, mô tả và nút.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "Tại sao nên chọn",
      cards: [
        {
          title: "TẠI SAO NÊN CHỌN\nPORO LANGUAGE SPACE",
          des: "Chúng tôi truyền cảm hứng học ngôn ngữ bằng niềm đam mê sâu sắc, không ngừng tìm kiếm cơ hội để kết nối và khám phá. Mục tiêu không chỉ là mang đến bài học chất lượng, mà còn tạo ra trải nghiệm học tập ý nghĩa. Tại PLS Language Daily, chúng tôi xây dựng cộng đồng vững mạnh, nơi mỗi thành viên tìm thấy niềm vui, sự hỗ trợ và động lực – cùng nhau chinh phục ngôn ngữ và kết nối toàn cầu.",
          contents: [BUTTON],
        },
      ],
    }),
  },
  home_ecosystem: {
    key: "home_ecosystem",
    label: "Trang chủ · Hệ sinh thái ứng dụng",
    description: "Slider: ảnh điện thoại, tên ứng dụng, các ứng dụng khác và nút tải trên cửa hàng.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "HỆ SINH THÁI ỨNG DỤNG",
      des: "Hệ Sinh Thái Ứng Dụng Học Tập Cho Riêng Từng Ngôn Ngữ",
      cards: [
        ecosystemCard(
          "NHẬT NGỮ SAKUMI",
          "Ứng Dụng Học Tiếng Nhật",
          "Nơi bạn tìm thấy mọi nội dung đã học, từ phát âm đến từ vựng và luyện nghe. Một không gian để tổ chức và đánh giá hành trình học tập của bạn.",
        ),
        ecosystemCard("ỨNG DỤNG MỚI", "Tiêu đề phụ", "Mô tả ứng dụng"),
      ],
    }),
    addItem: { label: "Thêm slide", run: addCard(ecosystemCard("ỨNG DỤNG MỚI", "Tiêu đề phụ", "Mô tả ứng dụng"), "home_ecosystem") },
  },
  home_journey: {
    key: "home_journey",
    label: "Trang chủ · Hành trình cùng",
    description: "Tiêu đề căn trái, đoạn mô tả và 3 thẻ trắng có hình minh hoạ.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "HÀNH TRÌNH CÙNG\nPORO LANGUAGE SPACE",
      des: "Cung cấp một trải nghiệm hành trình phù hợp ngoại ngữ, mở ra cánh cửa hướng tới thế giới. Tại Poro Language Space, việc học ngôn ngữ trở thành hành trình khám phá bản thân, từng bước vững chắc và kết nối.",
      cards: ["Cá nhân hóa lộ trình\ncho từng học viên", "Đội ngũ giáo viên\ncó chứng chỉ rõ ràng", "Ứng dụng hỗ trợ\nhọc tập xuyên suốt"].map((title) => ({ title })),
    }),
    addItem: { label: "Thêm thẻ", run: addCard({ title: "Tiêu đề thẻ" }, "home_journey") },
  },
  home_products: {
    key: "home_products",
    label: "Trang chủ · Sản phẩm nổi bật",
    description: "Dải thẻ ứng dụng (4 thẻ mỗi lần): icon, tên, gạch đầu dòng, điểm sao, lượt tải và nút cửa hàng.",
    sectionType: SectionType.CONTENT,
    build: () => ({
      title: "CÁC SẢN PHẨM NỔI BẬT",
      des: "Top 1 Rating Các Ứng Dụng Học Ngôn Ngữ",
      cards: ["PORO - Từ Vựng tiếng Nhật", "PORO - Nghe Nói tiếng Nhật", "PORO - Ngữ Pháp tiếng Nhật", "PORO - Kanji tiếng Nhật"].map(productCard),
    }),
    addItem: { label: "Thêm sản phẩm", run: addCard(productCard("Sản phẩm mới"), "home_products") },
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
  "about_hero",
  "about_partners",
  "about_story",
  "about_values",
  "about_stats",
  "about_gallery",
  "about_goals",
  "about_principles",
  "about_timeline",
  "about_tech",
];

/** Order of the sections in the "Trang chủ" Figma page. */
export const HOME_PAGE_ORDER: TemplateKey[] = [
  "home_hero",
  "home_partners",
  "home_centers",
  "home_why",
  "home_ecosystem",
  "home_journey",
  "home_products",
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
