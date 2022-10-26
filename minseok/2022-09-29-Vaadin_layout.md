# Vaadin - Layout

## Layout

Vaadin의 화면을 구성하기 위해서는 기본적으로 Layout을 알아야 한다.
Layout 위에 컴포넌트가 구성되어 컴포넌트는 그 레이아웃의 특성에 맞게 배치된다.
또한 레이아웃 자체도 컴포넌트이기 때문에 레이아웃 안에 레이아웃을 추가할 수 있다.
그렇기 때문에 Vaadin에서 제공하는 여러 레이아웃의 조합을 통해 다양한 화면 구성이 가능하다.

### 기본 Layout

#### DIV : HTML DIV 태그를 그대로 표현

#### Vertical : 내부 Component를 수직적으로 나열
![image](https://user-images.githubusercontent.com/6725753/192472727-46cda8b7-a059-4f85-a3a5-dee18d82bc3a.png)

```java
    @Route("basic-layouts/vertical-layout")
    public class BasicLayoutsVerticalLayout extends Div {
    public BasicLayoutsVerticalLayout() {
    VerticalLayout layout = new VerticalLayout();
    layout.add(new Button("Button 1"));
    layout.add(new Button("Button 2"));
    layout.add(new Button("Button 3"));
    layout.add(new Button("Button 4"));
    
            this.setClassName("basic-layouts-example");
    
            this.add(layout);
        }
    
    }
```
  - Vertical Alignment
    - ![image](https://user-images.githubusercontent.com/6725753/192472130-4e820c64-de22-4bf9-8df5-5ddf0e3550d5.png)
    - https://vaadin.com/docs/latest/example?embed=basic-layouts-vertical-layout-vertical-alignment-wc.js&import=component/basiclayouts/basic-layouts-vertical-layout-vertical-alignment.ts
    - ```java
      List<JustifyContentModeOption> options = Arrays
                .asList(new JustifyContentModeOption("Start (default)",
                                FlexComponent.JustifyContentMode.START),
                        new JustifyContentModeOption("Center",
                                FlexComponent.JustifyContentMode.CENTER),
                        new JustifyContentModeOption("End",
                                FlexComponent.JustifyContentMode.END),
                        new JustifyContentModeOption("Between",
                                FlexComponent.JustifyContentMode.BETWEEN),
                        new JustifyContentModeOption("Around",
                                FlexComponent.JustifyContentMode.AROUND),
                        new JustifyContentModeOption("Evenly",
                                FlexComponent.JustifyContentMode.EVENLY));
      
      ...
      
      VerticalLayout layout = new VerticalLayout();
      layout.add(new Button("Button 1"));
      layout.add(new Button("Button 2"));
      layout.add(new Button("Button 3"));
    
      ...
    
      radioGroup.addValueChangeListener(e -> {
      FlexComponent.JustifyContentMode mode = e.getValue().getMode();
      layout.setJustifyContentMode(mode);
      });
      ```
  - Horizontal Alignment
    - ![image](https://user-images.githubusercontent.com/6725753/192473710-ad5c9ffd-5439-43a1-bcf0-8492452f0ec5.png)
    - https://vaadin.com/docs/latest/example?embed=basic-layouts-vertical-layout-horizontal-alignment-wc.js&import=component/basiclayouts/basic-layouts-vertical-layout-horizontal-alignment.ts
    - ```java
    
       @Route("basic-layouts/vertical-layout-horizontal-alignment")
       public class BasicLayoutsVerticalLayoutHorizontalAlignment extends Div {
    
        private static class AlignmentOption {
            private final String label;
            private final FlexComponent.Alignment alignment;
    
            public AlignmentOption(String label,
                    FlexComponent.Alignment alignment) {
                this.label = label;
                this.alignment = alignment;
            }
    
            public FlexComponent.Alignment getAlignment() {
                return alignment;
            }
    
            @Override
            public String toString() {
                return label;
            }
        }
    
        public BasicLayoutsVerticalLayoutHorizontalAlignment() {
            VerticalLayout layout = new VerticalLayout();
            layout.add(new Button("Button 1"));
            layout.add(new Button("Button 2"));
            layout.add(new Button("Button 3"));
    
            List<AlignmentOption> options = Arrays
                    .asList(new AlignmentOption("Start (default)",
                                    FlexComponent.Alignment.START),
                            new AlignmentOption("Center",
                                    FlexComponent.Alignment.CENTER),
                            new AlignmentOption("End", FlexComponent.Alignment.END),
                            new AlignmentOption("Stretch",
                                    FlexComponent.Alignment.STRETCH));
    
            RadioButtonGroup<AlignmentOption> radioGroup = new RadioButtonGroup<>();
            radioGroup.setLabel("Horizontal alignment");
            radioGroup.setItems(options);
            radioGroup.setValue(options.get(0));
            radioGroup.addValueChangeListener(e -> {
                FlexComponent.Alignment alignment = e.getValue().getAlignment();
                layout.setAlignItems(alignment);
            });
    
            this.setClassName("basic-layouts-example");
    
            this.add(layout, radioGroup);
        }
    
    }
    ```

#### Horizontal : 내부 Component를 수평적으로 나열

![image](https://user-images.githubusercontent.com/6725753/192472970-63193ef6-6337-4e0d-8a65-3fa7c657915a.png)
```java
      @Route("basic-layouts/horizontal-layout")
      public class BasicLayoutsHorizontalLayout extends Div {
      public BasicLayoutsHorizontalLayout() {
      HorizontalLayout layout = new HorizontalLayout();
      layout.setPadding(true);
      layout.add(new Button("Button 1"));
      layout.add(new Button("Button 2"));
      layout.add(new Button("Button 3"));
      layout.add(new Button("Button 4"));
    
              this.setClassName("basic-layouts-example");
    
              this.add(layout);
          }
    
      }
```
- Vertical Alignment
  - https://vaadin.com/docs/latest/example?embed=basic-layouts-horizontal-layout-vertical-alignment-wc.js&import=component/basiclayouts/basic-layouts-horizontal-layout-vertical-alignment.ts
  - ![image](https://user-images.githubusercontent.com/6725753/192477020-3e9e8900-9302-48f1-9878-d651e3ce6f15.png)
- Horizontal Alignment
  - https://vaadin.com/docs/latest/example?embed=basic-layouts-horizontal-layout-horizontal-alignment-wc.js&import=component/basiclayouts/basic-layouts-horizontal-layout-horizontal-alignment.ts
  - ![image](https://user-images.githubusercontent.com/6725753/192477901-0eca9fae-989f-49cb-abbf-800262b21979.png)

### 그 외 Layout

#### Form Layout

폼 레이아웃을 사용하면 여러 열이 있는 반응형 양식을 작성하고 입력 레이블을 입력 위나 옆에 배치할 수 있다


![image](https://user-images.githubusercontent.com/6725753/193002021-8f5a188f-2fbe-43a9-9c07-b02fd2ab7133.png)

```java
@Route("form-layout-basic")
public class FormLayoutBasic extends Div {

    public FormLayoutBasic() {
        TextField firstName = new TextField("First name");
        TextField lastName = new TextField("Last name");
        TextField username = new TextField("Username");
        PasswordField password = new PasswordField("Password");
        PasswordField confirmPassword = new PasswordField("Confirm password");

        FormLayout formLayout = new FormLayout();
        formLayout.add(firstName, lastName, username, password,
                confirmPassword);
        formLayout.setResponsiveSteps(
                // Use one column by default
                new ResponsiveStep("0", 1),
                // Use two columns, if layout's width exceeds 500px
                new ResponsiveStep("500px", 2));
        // Stretch the username field over 2 columns
        formLayout.setColspan(username, 2);

        add(formLayout);
    }

}
```
가로 사이즈가 500px 이하일때

![image](https://user-images.githubusercontent.com/6725753/193002712-009355c2-046f-4a67-9d2a-1799e5e8896d.png)

해상도 별로 컬럼 수를 다르게 넣울 수도 있다
```java
formLayout.setResponsiveSteps(
        // Use one column by default
        new ResponsiveStep("0", 1),
        // Use two columns, if the layout's width exceeds 320px
        new ResponsiveStep("320px", 2),
        // Use three columns, if the layout's width exceeds 500px
        new ResponsiveStep("500px", 3));
```

#### App Layout
App의 전체 구성을 가지고 있는 레이아웃. 메뉴 위치/숨김 처리 등을 할 수 있다.

![image](https://user-images.githubusercontent.com/6725753/193004100-8eaed253-3886-46b3-91c3-fda488ea156e.png)

```java
@Route("app-layout-basic")
public class AppLayoutBasic extends AppLayout {

  public AppLayoutBasic() {
    DrawerToggle toggle = new DrawerToggle();

    H1 title = new H1("MyApp");
    title.getStyle()
      .set("font-size", "var(--lumo-font-size-l)")
      .set("margin", "0");

    Tabs tabs = getTabs();

    addToDrawer(tabs);
    addToNavbar(toggle, title);
  }

  private Tabs getTabs() {
    Tabs tabs = new Tabs();
    tabs.add(
      createTab(VaadinIcon.DASHBOARD, "Dashboard"),
      createTab(VaadinIcon.CART, "Orders"),
      createTab(VaadinIcon.USER_HEART, "Customers"),
      createTab(VaadinIcon.PACKAGE, "Products"),
      createTab(VaadinIcon.RECORDS, "Documents"),
      createTab(VaadinIcon.LIST, "Tasks"),
      createTab(VaadinIcon.CHART, "Analytics")
    );
    tabs.setOrientation(Tabs.Orientation.VERTICAL);
    return tabs;
  }

  private Tab createTab(VaadinIcon viewIcon, String viewName) {
    Icon icon = viewIcon.create();
    icon.getStyle()
            .set("box-sizing", "border-box")
            .set("margin-inline-end", "var(--lumo-space-m)")
            .set("margin-inline-start", "var(--lumo-space-xs)")
            .set("padding", "var(--lumo-space-xs)");

    RouterLink link = new RouterLink();
    link.add(icon, new Span(viewName));
    // Demo has no routes
    // link.setRoute(viewClass.java);
    link.setTabIndex(-1);

    return new Tab(link);
  }
}
```