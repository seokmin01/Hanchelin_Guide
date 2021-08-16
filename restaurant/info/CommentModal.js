import React, { useState } from 'react';
import { Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { IconButton, Icon, Input, Button, Slider } from 'native-base';
import Modal from 'react-native-modal';
import { Rating, AirbnbRating } from 'react-native-ratings';
import Font from 'react-native-vector-icons/FontAwesome5';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';

const CommentButton = (props) => {
  const user = auth().currentUser; //현재 유저 정보 불러오기
  const [onInput, showInput] = useState(false);
  const [isDeliver, setDeliver] = useState(false);

  // 여기서 가게 이름 (doc)을 현재 들어간 가게에 따라서 가져와야 한다
  let commentRef = database().ref(props.commentsDir);
  let reviewRef = firestore().collection('가게').doc(props.restaurantData['official_name']).collection('리뷰');
  let commentList = props.restaurantData['comments'] ? props.restaurantData['comments'] : [];
  const commentsCount = props.restaurantData['comments_count'];

  const [flavor, setFlavor] = useState(2.5); //맛
  const [costPerf, setCostPerf] = useState(2.5); //가성비
  const [service, setService] = useState(2.5); //서비스
  const [overall, setOverall] = useState(3); //종합
  const [total, setTotal] = useState(''); //총평
  const [delivTime, setDelivTime] = useState(30); //배달시간
  const [delivFee, setDelivFee] = useState(0); //배달비

  async function addReview() {
    await reviewRef.add({
      맛: flavor,
      가성비: costPerf,
      서비스: service,
      종합: overall,
      총평: total,
      배달시간: delivTime,
      배달비: delivFee,
      작성시간: new Date(),
      uid: user?.uid,
    })
      .then(querySnapshot => {
        commentList.push({
          맛: flavor,
          가성비: costPerf,
          서비스: service,
          종합: overall,
          총평: total,
          배달여부: isDeliver,
          배달시간: delivTime,
          배달비: delivFee,
          작성시간: new Date().toLocaleString(),
          uid: user?.uid,
          query: querySnapshot.id
        });

        commentRef.update({
          comments: commentList,
          comments_count: commentsCount + 1,
          flavor: (props.restaurantData['flavor'] * commentsCount + flavor) / (commentsCount + 1),
          cost_performance: (props.restaurantData['cost_performance'] * commentsCount + costPerf) / (commentsCount + 1),
          service: (props.restaurantData['service'] * commentsCount + service) / (commentsCount + 1),
          overall: (props.restaurantData['overall'] * commentsCount + overall) / (commentsCount + 1)
        });
      })

    setFlavor(2.5);
    setCostPerf(2.5);
    setService(2.5);
    setOverall(3);
    setTotal('');
    setDelivTime(30);
    setDelivFee(0);
  }

  function DeliverOption(props) {
    if (props.isDeliver) {
      return (
        <>
          <Text style={style.commentText}>배달시간</Text>
          <Slider
            w="80%"
            alignSelf="center"
            defaultValue={delivTime}
            maxValue={60}
            step={5}
            onChange={time => setDelivTime(time)}
          >
            <Slider.Track>
              <Slider.FilledTrack />
            </Slider.Track>
            <Slider.Thumb />
          </Slider>
          <Text style={{ textAlign: 'right' }}>
            {delivTime}분{(delivTime == 60) ? ' 이상' : ''}
          </Text>
          <Text style={style.commentText}>배달비</Text>
          <Input
            size="sm"
            w={250}
            isRequired={true}
            keyboardType="numeric"
            variant="underlined"
            alignSelf="flex-end"
            textAlign="right"
            multiline={false}
            InputRightElement={<Text style={{ fontWeight: 'bold' }}>원</Text>}
            placeholder="들었던 배달 비용을 적어주세요."
            onChange={fee => setDelivFee(parseInt(fee))}
          />
        </>
      );
    }
    return (<></>);
  }

  return (
    <>
      <Modal
        style={{ justifyContent: 'flex-end', alignItems: 'center' }}
        isVisible={onInput}
        onModalWillHide={props.onFinish}
        onBackButtonPress={() => showInput(false)}
        onBackdropPress={() => showInput(false)}
      >
        <SafeAreaView style={style.commentView}>
          <Text style={style.commentHeader}>식당 리뷰</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={style.commentText}>주문 방식</Text>
            <Button.Group alignSelf="center">
              <Button
                colorScheme={isDeliver ? "rgb(4, 120, 87)" : "rgb(52, 211, 153)"}
                onPress={() => setDeliver(true)}>
                배달
              </Button>
              <Button
                colorScheme={!isDeliver ? "rgb(4, 120, 87)" : "rgb(52, 211, 153)"}
                onPress={() => setDeliver(false)}>
                방문
              </Button>
            </Button.Group>
            <DeliverOption isDeliver={isDeliver} />
            <Text style={style.commentText}>맛</Text>
            <Text style={style.ratingText}>{flavor} / 5</Text>
            <Rating
              startingValue={flavor}
              imageSize={20}
              fractions={1}
              onSwipeRating={rating => setFlavor(rating)}
              onFinishRating={rating => setFlavor(rating)}
            />
            <Text style={style.commentText}>가성비</Text>
            <Text style={style.ratingText}>{costPerf} / 5</Text>
            <Rating
              startingValue={costPerf}
              imageSize={20}
              fractions={1}
              onSwipeRating={rating => setCostPerf(rating)}
              onFinishRating={rating => setCostPerf(rating)}
            />
            <Text style={style.commentText}>서비스</Text>
            <Text style={style.ratingText}>{service} / 5</Text>
            <Rating
              startingValue={service}
              imageSize={20}
              fractions={1}
              onSwipeRating={rating => setService(rating)}
              onFinishRating={rating => setService(rating)}
            />
            <Text style={style.commentText}>종합 평가</Text>
            <AirbnbRating
              starImage={require('./rice-icon.jpeg')}
              count={5}
              reviews={['다시는 안 먹어요..', '가끔씩은 괜찮을 듯?', '무난해요.', '꽤 자주 갈꺼 같아요', '없던 병이 낫는 식당']}
              defaultRating={3}
              selectedColor="#13ACBF"
              size={25}
              reviewColor="#13ACBF"
              reviewSize={18}
              onFinishRating={rating => setOverall(rating)}
            />
            <Input
              style={{ marginVertical: 20 }}
              w={270}
              minHeight={150}
              variant="filled"
              textAlignVertical="top"
              multiline={true}
              placeholder="해당 식장에 대한 총평을 적어주세요."
              value={total}
              onChangeText={setTotal}
            />
          </ScrollView>
          <Button.Group style={{ marginVertical: 10 }}>
            <Button
              colorScheme="rgb(14, 165, 233)"
              onPress={() => {
                addReview();
                showInput(false);
              }}
            >
              완료
            </Button>
            <Button
              colorScheme="rgb(251, 113, 133)"
              onPress={() => showInput(false)}
            >
              취소
            </Button>
          </Button.Group>
        </SafeAreaView>
      </Modal>
      <IconButton
        style={style.commentButton}
        borderRadius="full"
        colorScheme="cyan"
        variant="solid"
        size="lg"
        onPress={() => showInput(true)}
        icon={<Icon name="comment-alt" as={Font} size="sm" />}
      />
    </>
  );
}

export default CommentButton;

const style = StyleSheet.create({
  commentView: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: '95%',
    height: '85%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  commentButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#333333',
    shadowRadius: 2,
    shadowOpacity: 0.7,
    elevation: 15
  },
  commentHeader: {
    fontWeight: 'bold',
    marginVertical: 25,
    fontSize: 22
  },
  commentText: {
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    fontSize: 16,
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 8
  },
  ratingText: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    color: '#f1c40f',
    marginVertical: 10
  }
})