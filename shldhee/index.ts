class Person {
  public height: number;
  private weight: number;
  protected age: number;

  constructor(height: number, weight: number, age: number) {
    this.height = height;
    this.weight = weight;
    this.age = age;
  }

  protected getWeight() {
    return this.weight;
  }
}

class Lee extends Person {
  constructor(height: number, weight: number, age: number) {
    super(height, weight, age);
  }

  public getHeight() {
    return this.height;
  }
  public subGetWeight() {
    // return this.weight; // Property 'weight' is private and only accessible within class 'Person'.
    return this.getWeight();
  }
  public getAge() {
    return this.age;
  }
}

const lee = new Lee(190, 100, 30);
console.log(lee.getHeight());
console.log(lee.subGetWeight());
console.log(lee.getAge());
// console.log(lee.age); Property 'age' is protected and only accessible within class 'Person' and its subclasses.

## 결론

- 타입스크립트를 책을 보고 간략히 요약해봤다.
- 자세한 내용은 공식홈페이를 통해 살펴보시길 바란다.
- [타입스크립트 공홈](typescriptlang.org)
