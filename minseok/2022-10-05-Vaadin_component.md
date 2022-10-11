# Vaadin - Component

- Vaadin은 40개 이상의 컴포넌트를 지원한다.
  - https://vaadin.com/docs/latest/components
- 각 컴포넌트는 custom element로 만들어지기 때문에 자바 코드가 아닌 클라이언트 사이드의 HTML로 컴포넌트를 추가 할 수 있다. 
- Vaadin에서 제공하는 컴포넌트 외에 커스텀 컴포넌트를 만들어 사용할 수도 있다. 예를 들어 네이버맵 같은 라이브러리를 컴포넌트화 해서 사용할 수 있다.(이건 다음에 다른 꼭지로..)
  - https://vaadin.com/docs/latest/create-ui/web-components
- Vaadin에서 제공하는 컴포넌트는 Vaadin의 테마 기능을 사용할 수 있다. 이 말은 내가 만든 테마를 추가해서 웹화면 전체적으로 나만의 테마로 화면을 디자인 할 수 있다는 뜻이다.
  - 커스텀 테마를 디자인 할 수 있는 툴도 제공한다.
  - https://vaadin.com/docs/latest/styling/custom-theme/theme-editor
- 컴포넌트의 스타일을 CSS 통하여 변경할 수 있다.(자바코드에서도 할 수 있고 직접 CSS 파일을 import 할 수도 있다)


Vaadin에서 기본으로 제공하는 컴포넌트 몇 가지를 살펴보면서 사용법을 알아보자.

## Button
https://vaadin.com/docs/latest/components/button

```java
@Route("button")
public class button extends VerticalLayout {

    public button() {
        AtomicInteger count = new AtomicInteger();
        
        //버튼 생성
        var button = new Button("Button1");
        //문단 생성
        var header = new Paragraph("Count : "+count);
        //버튼과 문단을 현재 레이아웃에 추가
        add(header, button);

        //버튼에 이벤트 설정
        button.addClickListener(event -> {
            count.getAndIncrement();
            header.setText("Count : "+count);
        });
    }

}
```

![image](https://user-images.githubusercontent.com/6725753/194240312-9a2d10dc-8cd8-44f1-b214-4a1ca95b6e5b.png)


## Text Field
https://vaadin.com/docs/latest/components/text-field

```java
@Route("textfield")
public class TextFieldExample extends VerticalLayout {

    public TextFieldExample() {
        TextField textField = new TextField();
        textField.setLabel("Street Address");
        textField.setValue("Ruukinkatu 2");
        textField.setClearButtonVisible(true);
        textField.setPrefixComponent(VaadinIcon.MAP_MARKER.create());

        TextField textField2 = new TextField();

        textField.addKeyDownListener(Key.ENTER, event -> {
            textField2.setValue(textField.getValue());
        });

        add(textField, textField2);
    }

}
```

![image](https://user-images.githubusercontent.com/6725753/194243187-4a0b14fe-05c0-45c4-9d63-0b566d04823b.png)

## Date Time Picker
https://vaadin.com/docs/latest/components/date-time-picker

```java
@Route("datetimepicker")
public class DateTimePickerExample extends VerticalLayout {

    public DateTimePickerExample() {
        DateTimePicker dateTimePicker = new DateTimePicker();
        dateTimePicker.setLabel("Meeting date and time");
        var btn = new Button("현재 시간");
        btn.addClickListener(event -> {
           dateTimePicker.setValue(LocalDateTime.now());
        });
        add(dateTimePicker, btn);
    }

}
```

![image](https://user-images.githubusercontent.com/6725753/194244415-8490ca39-2631-4b21-82c8-123d42ed5873.png)


## Grid
https://vaadin.com/docs/latest/components/grid

```java
@Route("grid")
public class GridExample extends VerticalLayout {

    public GridExample() {
        Grid<Person> grid = new Grid<>(Person.class, true);
//        grid.addColumn(Person::getFirstName).setHeader("First name");
//        grid.addColumn(Person::getLastName).setHeader("Last name");
//        grid.addColumn(Person::getEmail).setHeader("Email");

        var btn = new Button("입력");
        btn.addClickListener(event -> {
            grid.setItems(getPeople());
        });

        var name = new TextField("이름");
        var email = new TextField("메일주소");
        grid.addSelectionListener(selectionEvent -> {
           selectionEvent.getFirstSelectedItem().ifPresent(person -> {
               name.setValue(person.getFirstName() + " " + person.getLastName());
               email.setValue(person.getEmail());
           });
        });

        add(grid, btn, name, email);
    }

    private List<Person> getPeople() {
        List<Person> list = new ArrayList<>();
        list.add(new Person("민석","김", "김민석@메일.주소"));
        list.add(new Person("abc","efg", "abc@xy.z"));
        list.add(new Person("길동","홍", "홍길동@메일.주소"));
        
        return list;
    }

}
```
![image](https://user-images.githubusercontent.com/6725753/194253014-c9cd22a4-2c9c-436e-99e6-39a196dd0532.png)

일반적으로 예상되는 멀티셀렉팅 / 그룹핑 / 필터링 / 컬럼별렌더링 / 툴팁 / 에디팅 / 드래그앤드랍 등 필요한건 다 지원하고 있음