export function createComfortMessage(selected: readonly string[]) {
  if (selected.some((emotion) => ["불안", "두려움"].includes(emotion))) {
    return "불안한 마음을 솔직하게 마주했어요. 깊게 숨 한번 쉬고, 오늘 하루도 잘 견뎌낸 나를 다독여주세요.";
  }
  if (
    selected.some((emotion) =>
      ["슬픔", "외로움", "무기력", "지침"].includes(emotion),
    )
  ) {
    return "오늘 많이 지쳤군요. 여기에 마음을 남겨줘서 고마워요. 오늘 하루 버텨낸 것만으로도 충분해요.";
  }
  return "오늘의 감정을 솔직하게 기록해줘서 고마워요. 지금의 마음을 알아차린 시간이 오래 따뜻하게 남기를 바라요.";
}
