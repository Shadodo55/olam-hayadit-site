import type { StructureResolver } from "sanity/structure";

/**
 * The Studio's side menu, in Hebrew, in the order the store owner uses it.
 * Every S.list() / S.documentList() needs an explicit .id() in Sanity 6.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .id("root")
    .title("ניהול האתר")
    .items([
      S.listItem()
        .title("פרטי העסק ושעות פתיחה")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("פרטי העסק ושעות פתיחה"),
        ),
      S.listItem()
        .title("דף הבית")
        .id("homePage")
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("דף הבית"),
        ),
      S.divider(),
      S.listItem()
        .title("מוצרים")
        .id("products")
        .child(
          S.list()
            .id("products-menu")
            .title("מוצרים")
            .items([
              S.listItem()
                .title("כל המוצרים")
                .id("allProducts")
                .child(S.documentTypeList("product").title("כל המוצרים")),
              S.listItem()
                .title("לפי קטגוריה")
                .id("productsByCategory")
                .child(
                  S.documentTypeList("category")
                    .title("בחרו קטגוריה")
                    .child((categoryId) =>
                      S.documentList()
                        .id(`category-products-${categoryId}`)
                        .title("מוצרים בקטגוריה")
                        .schemaType("product")
                        .filter(
                          '_type == "product" && $categoryId in categories[]._ref',
                        )
                        .params({ categoryId }),
                    ),
                ),
              S.listItem()
                .title("חדשים בחנות")
                .id("newProducts")
                .child(
                  S.documentList()
                    .id("new-products-list")
                    .title("חדשים בחנות")
                    .schemaType("product")
                    .filter('_type == "product" && isNew == true'),
                ),
              S.listItem()
                .title("מוצרים לדוגמה (למחיקה לפני ההשקה)")
                .id("sampleProducts")
                .child(
                  S.documentList()
                    .id("sample-products-list")
                    .title("מוצרים לדוגמה")
                    .schemaType("product")
                    .filter('_type == "product" && isSample == true'),
                ),
            ]),
        ),
      S.documentTypeListItem("category").title("קטגוריות"),
      S.documentTypeListItem("brand").title("מותגים"),
      S.documentTypeListItem("finish").title("גימורים וצבעים"),
      S.documentTypeListItem("material").title("חומרים"),
      S.divider(),
      S.documentTypeListItem("project").title("פרויקטים והשראה"),
      S.documentTypeListItem("catalogFile").title("קטלוגים להורדה"),
      S.documentTypeListItem("faq").title("שאלות נפוצות"),
      S.documentTypeListItem("page").title("עמודי תוכן ומשפט"),
    ]);
