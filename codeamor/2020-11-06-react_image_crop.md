# React Image Crop

: dependencies가 필요 없는 React 이미지 자르기 오픈 소스입니다.

<br>

# Why react-image-crop ?

최근 npm trend에서 가장 많은 사용이 있었던 이미지 자르기 오픈소스입니다.

 > ![image](https://user-images.githubusercontent.com/65898889/100961410-b172ec80-3565-11eb-9d6a-d8c5cf4f2eeb.png)


<br>

# 특징

- 사용자가 픽셀과 퍼센티지를 사용할 수 있어 유연합니다.
- 터치가 가능합니다. (모바일)
- 이미지 자르기 시에 영역 자유 선택과 고정 선택이 가능합니다.
- 키보드로 미세 조정이 가능합니다.
- dependencies가 필요 없고, 용량이 작습니다.
- 최소/최대 자르기 사이즈를 지정할 수 있습니다.

<br>

# 설치


`npm i react-image-crop --save`

<br>

# 사용법

> App.js 에 import 합니다.

```js
import ReactCrop from 'react-image-crop';
```

> ReactCrop.css or ReactCrop.scss (깃허브 )

```js
import 'react-image-crop/dist/ReactCrop.css';
// or scss:
import 'react-image-crop/lib/ReactCrop.scss';
```
<br>

# 예시

```js
function CropDemo({ src }) {
  const [crop, setCrop] = useState({ aspect: 16 / 9 });
  return <ReactCrop src={src} crop={crop} onChange={newCrop => setCrop(newCrop)}/>;
}
```
<br>

# Props

> src

```js
<ReactCrop src="path/to/image.jpg" />
```

- blob url (URL.createObjectURL(), URL.revokeObjectURL()) 을 사용해도 되고,
  base64 데이터를 사용해도 됩니다.

<br>

> onChange(crop, percentCrop) (필수)

: 자르기 동작의 모든 변화마다 실행되는 콜백 함수 입니다. (드래그 / 크기 조정)

- 이 콜백을 실행하고 crop 상태를 업데이트 하지 않으면 아무 것도 발생하지 않습니다.

```js
onChange = crop => {
  this.setState({ crop });
}
```
<br>

> crop

- 모든 crop params는 초기 설정이 가능합니다.

- 처음엔 crop 객체를 생략할 수 있지만 이후의 모든 변경 사항은 onChange로 상태로 저장하여 컴포넌트에 전달해야 합니다.

```js
crop: {
  unit: 'px', // default, can be 'px' or '%'
  x: 130,
  y: 50,
  width: 200,
  height: 200
}

<ReactCrop src="path/to/image.jpg" crop={this.state.crop} />
```

> 너비와 높이 값을 생략할 수 있습니다.

```js
crop: {
  aspect: 16 / 9;
}
```

> 너비와 높이 중 하나만 설정하면 비례하여 나머지 값을 지정해 줍니다.

```js
crop: {
  unit: '%',
  width: 50,
  height: 50,
}
```

- 위의 예에서는 렌더링 된 이미지 크기의 50%인 자르기를 만듭니다. 값은 이미지의 백분율이므로 이미지도 정사각형 인 경우에만 정사각형이됩니다.

<br>

# Options

- minWidth

- minHeight

- maxWidth

- maxHeight

- keepSelection

: true가 전달되면 사용자가 선택 영역 외부를 클릭하면 선택을 비활성화 할 수 없습니다.

- disabled

: 참이면 자르기를 만들거나 크기를 조정할 수 없습니다.

- locked

: 참이면 자르기를 만들거나 크기를 조정할 수 없지만 기존 자르기는 계속 드래그 할 수 있습니다.

- className

- style

- imageStyle

- imageAlt

- onComplete(crop, percentCrop)

- onImageLoaded(image)

```js
onImageLoaded = image => {
  this.setState({ crop: { width: image.width, height: image.height } });
  return false; // Return false when setting crop state in here.
  // setState 중인 crop state가 여기로 올 때 false가 반환된다.
};
```

- crop 객체를 바꾸고 있다면 반드시 이 콜백에서 false를 반환해야 합니다.

- onImageError(event)

: 이미지 로드 중 오류가 발생한 경우 호출됩니다.

- onDragStart(event)

: 드래그 혹은 크기 조정을 시작할 때 발생하는 콜백입니다.

- onDragEnd(event)

: 드래그 또는 크기 조정 후 사용자가 커서를 놓거나 터치 할 때 발생하는 콜백입니다.

- crossorigin

: 이미지에 crossorigin 속성을 설정합니다.

- renderSelectionAddon(state)

: 자르기 선택에서 사용자 지정 요소를 렌더링합니다.

- renderComponent

: 이미지 대신 커스텀 HTML 요소를 렌더링합니다. 비디오를 지원하려는 경우 유용합니다.

```js
const videoComponent = (
  <video
    autoPlay
    loop
    style={{ display: 'block', maxWidth: '100%' }}
    onLoadStart={e => {
      // 미디어가 로드되면 ReactCrop에 알려야 합니다.
      e.target.dispatchEvent(new Event('medialoaded', { bubbles: true }));
    }}
  >
    <source src="sample.mp4" type="video/mp4" />
  </video>
);

<ReactCrop onChange={this.onCropChange} renderComponent={videoComponent} />;
```

- circularCrop

: 자르기 영역을 원으로 표시합니다. 기본값은 false 입니다.

<br>

# 구현

## Preview

```html
<div className="App">
<!-- 파일 선택 영역 -->
  <div>
    <input type="file" accept="image/*" onChange={this.onSelectFile} />
  </div>
  <!-- 선택된 파일을 편집하는 원본 이미지 영역 -->
  {src && (
    <ReactCrop
      src={src}
      crop={crop}
      ruleOfThirds
      onImageLoaded={this.onImageLoaded}
      onComplete={this.onCropComplete}
      onChange={this.onCropChange}
    />
  )}
  <!-- 편집된 이미지를 보여주는 영역 -->
  {croppedImageUrl && (
    <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
  )}
</div>
```

<br>

## 컴포넌트의 초기 state

```js
  state = {
    // 업로드할 이미지의 소스
    src: null,
    crop: {
      // 편집할 이미지의 정보
      unit: '%',
      width: 30,
      aspect: 16 / 9,
    },
  };
```

- 위 두 가지 상태는 필수 props입니다.

<br>

## 이미지 업로드

```js
onSelectFile = e => {
  // 파일이 있으면 (파일이 등록되면)
  if (e.target.files && e.target.files.length > 0) {
    // HTML5 의 FileAPI 를 사용합니다.
    // FileReader 객체를 reader 변수에 저장합니다.
    const reader = new FileReader();

    // readAsDataURL로 파일을 읽습니다
    reader.readAsDataURL(e.target.files[0]);

    // readAsDataURL 메서드 실행이 완료되면 onload 이벤트가 발생합니다.
    // 이 이벤트가 발생하면(읽기가 완료되면) 해당 이미지를 src state에 저장합니다.
    reader.addEventListener("load", () => {
      this.setState({ src: reader.result });
    });
  }
};
```

- input 태그에 onChange를 걸고 onSelectFile 함수가 동작하도록 만듭니다.

- 사용자가 파일을 등록하면, FileReader 객체를 생성하여 reader에 할당한 후 readAsDataURL로 파일을 읽어 들입니다.
 
- readAsDataURL 메서드의 실행이 완료되어 파일을 읽으면, onload 이벤트가 발생하여 src 에 결과를 저장합니다.

<br>

## 업로드한 이미지 편집

> 업로드한 이미지를 직접 자를 수 있도록 원본 이미지를 나타내고, 그 위에 잘려진 이미지를 나타냅니다.

```js
// 이미지가 등록되면 React 컴포넌트를 조건부 렌더링합니다.
{src && (
  <ReactCrop
    src={src}
    crop={crop}
    ruleOfThirds
    onImageLoaded={this.onImageLoaded}
    onComplete={this.onCropComplete}
    onChange={this.onCropChange}
  />
)}
```
<br>

> onImageLoaded(image)

: 로드된 이미지를 매개변수로 이를 ref로 만들어서 접근성을 높입니다.
```js
// 만약 여기서 crop state를 업데이트 시킨가면 마지막에 false를 반환시켜 주어야 합니다.
onImageLoaded = image => {
  this.imageRef = image;
}
```

<br>

> onCropChange(crop, percentCrop)

: 마우스 드래그(자르기) 중에 발생하는 이벤트를 감지하여 crop 객체를 갱신합니다.

```js
onCropChange = (crop, percentCrop) => {
  // 퍼센트 크롭을 사용해도 됩니다:
  //this.setState({ crop: percentCrop });
  this.setState({ crop });
};
```

<br>

> onCropComplete(crop,percentCrop)

: 마우스 드래그(자르기)가 끝나면 선택한 영역을 보여주는 콜백 함수를 작성합니다.

```js
onCropComplete = (crop, percentCrop) => {
  this.makeClientCrop(crop);
};
```

<br>

> makeClinetCrop(crop)

: 내부에서 getCroppedImg 함수를 호출합니다. <br>
이 함수는 매개변수인 this.imageRef, crop, 파일 이름을 받아서 잘려진 영역의 이미지를 전달합니다.

```js
async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      // getCroppedImg() 메서드 호출한 결과값을
      // state에 반영합니다.
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        "newFile.jpeg"
      );
      this.setState({ croppedImageUrl });
    }
}
```
<br>

> getCroppedImg(image, crop, fileName)

```js
getCroppedImg(image, crop, fileName) {
    // document 상에 canvas 태그 생성
    const canvas = document.createElement("canvas");
    // 캔버스 영역을 잘려진 이미지 크기 만큼 조절합니다.
    canvas.width = crop.width;
    canvas.height = crop.height;
    // getContext() 메서드를 활용하여 캔버스 렌더링 컨텍스트 함수 사용
    // 이 경우 drawImage() 메서드를 활용하여 이미지를 그린다
    const ctx = canvas.getContext("2d");

    // 화면에 잘려진 이미지를 그립니다.
    ctx.drawImage(
      // 원본 이미지 영역입니다.
      image, // 원본 이미지
      crop.x, // 잘려진 이미지 x 좌표
      crop.y, // 잘려진 이미지 y 좌표
      crop.width, // 잘려진 이미지 가로 길이
      crop.height, // 잘려진 이미지 세로 길이
      // canvas 영역
      0, // 이미지 시작 x 좌표
      0, // 이미지 시작 y 좌표
      crop.width, // 이미지 가로 길이
      crop.height // 이미지 세로 길이
    );

    // canvas 이미지를 base64 형식으로 인코딩된 URI 를 생성한 후 반환합니다.
    return new Promise(resolve => {
      resolve(canvas.toDataURL());
    });
}
```
- canvas 요소를 생성하고, 너비와 높이를 잘려진 이미지와 같게 만들어 줍니다.
- 렌더링과 관련된 메서드를 사용하기 위해 getContext 메서드를 호출하여 ctx 상수에 담습니다.
- canvas에 이미지를 그리는 drawImage 함수에 필요한 옵션을 준 뒤 호출합니다.
- 마지막으로, 해당 canvas에 나타난 이미지의 URI를 생성하여 반환합니다.

<br>

# Reference

[깃허브](https://github.com/DominicTobias/react-image-crop)

[티스토리](https://gamsungcoding.tistory.com/entry/React-React%EB%A1%9C-%EC%9D%B4%EB%AF%B8%EC%A7%80-%ED%8E%B8%EC%A7%91%ED%81%AC%EB%A1%AD-%ED%95%98%EA%B8%B0)