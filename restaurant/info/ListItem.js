import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image } from "native-base";
import { View, SafeAreaView, RefreshControl, StyleSheet, Dimensions, Animated } from 'react-native';
import Text from '../../defaultSetting/FontText';
// import Animated from 'react-native-reanimated';
import NaverMapView, { Marker } from 'react-native-nmap';
import { Rating } from 'react-native-ratings';
import { NativeBaseProvider, HStack, Center, Button } from 'native-base';
import Font from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CommentButton from './CommentModal';
import MapScreen from './MapScreen';
import { KeyTextView, InfoView, MenuListView, CommentListView, RatingBar } from './InfoElements';

const Stack = createNativeStackNavigator();

const MapView = (props) => {
  const navigation = useNavigation();

  if (props.position['latitude'] == undefined) {
    return <View style={style.mapView} />;
  }

  return (
    <NaverMapView
      style={style.mapView}
      center={{ ...props.position, zoom: 18 }}
      compass={false}
      scaleBar={true}
      zoomControl={true}
      minZoomLevel={6}
      maxZoomLevel={19}
      onMapClick={() => navigation.navigate("식당 위치", { name: props.restName, coordinate: props.position })}
    >
      <Marker
        coordinate={props.position}
        caption={{ text: props.restName }}
      />
    </NaverMapView>
  )
}

const RestComponent = (props) => {
  const user = auth().currentUser;
  const restData = props.restData;
  const menuList = restData['menu'];
  const commentsList = restData['comments'];
  let menu = [];
  let comments = [];

  if (typeof (menuList) === 'object') {
    for (const [id, order] of Object.entries(menuList)) {
      menu.push(
        <MenuListView key={id} order={order} />
      )
    }
  } else if (typeof (menuList) === 'string') {
    menu = <MenuListView order={menuList} />
  }

  if (commentsList !== undefined) {
    for (const [id, comment] of Object.entries(commentsList)) {
      if (comment != null) {
        comments.push(
          <CommentListView key={id} user={user} id={id} comment={comment} onPop={props.onPop} />
        )
      }
    }
  }

  const [tog, setTog] = useState(false);
  const navigation = useNavigation();
  return (
    <>
      <Animated.View style={props.scrollAnimation}>
        <MapView
          restName={restData['official_name']}
          position={{ latitude: restData['y'], longitude: restData['x'] }}
        />
      </Animated.View>
      <View style={style.partition}>
        <View style={[style.partitionPadding, { marginBottom: 15 }]}>
          <Rating
            type="custom"
            ratingImage={require('../../images/info-icon/star.png')}
            ratingColor="#BF2A52"
            ratingBackgroundColor="#ccc"
            startingValue={restData['total'] ? restData['total'] : 0}
            imageSize={50}
            fractions={1}
            readonly={true}
            onFinishRating={console.log}
          />
          <Text style={{ marginTop: 10, fontSize: 20, textAlign: "center" }}>
            {restData['total'] ? Math.round(restData['total'] * 10) / 10 : 0} / 5
          </Text>
        </View>
        <View style={style.basicInfoPadding}>
          <InfoView icon="mobile-phone" value={restData['contact']} />
          <InfoView icon="location-arrow" value={restData['address']} />
          <InfoView icon="clock-o" value={restData['opening_hours']} />
        </View>
        <HStack style={{ marginTop: 15, marginHorizontal: 10 }}>
          <Center style={[style.optionView, style.horizonStack]}>
            <Button style={style.optionButton} onPress={() => {
              navigation.navigate("같이 배달", { screen: "새로운 채팅방 만들기", params: { restName: restData['official_name'] } });
            }}>
              <Image
                alignSelf="center"
                resizeMode="contain"
                source={require('../../images/together.png')}
                alt="Alternate Text"
                size="40px"
              />
              <Text style={{ textAlign: "center", marginTop: 5 }}>같이배달</Text>
            </Button>
          </Center>
          <Center style={[style.optionView, style.horizonStack]}>
            <Button style={style.optionButton} onPress={() => setTog(!tog)}>
              <Font style={{ textAlign: "center" }} name={tog ? "heart" : "heart-o"} size={30} color="#f15c5c" />
              <Text style={{ textAlign: "center", marginTop: 5 }}>찜하기</Text>
            </Button>
          </Center>
          <Center style={[style.optionView, style.horizonStack, { borderRightWidth: 0 }]}>
            <Button style={style.optionButton} onPress={() => setTog(!tog)}>
              <Font style={{ textAlign: "center" }} name="share" size={30} color="#999999" />
              <Text style={{ textAlign: "center", marginTop: 5 }}>??? 공유</Text>
            </Button>
          </Center>
        </HStack>
      </View>
      <View style={[style.partition, style.partitionPadding]}>
        <View style={style.contexts}>
          <KeyTextView keyText="메뉴" />
        </View>
        {menu}
      </View>
      <View style={[style.partition, style.partitionPadding, style.endMargin]}>
        <View style={style.contexts}>
          <KeyTextView keyText="평점" />
        </View>
        <HStack>
          <Center style={style.horizonStack}>
            <RatingBar
              color="#eab308"
              bgText="#eab308"
              textColor="#fff"
              ratingName="맛"
              ratingData={restData['flavor']}
            />
          </Center>
          <Center style={style.horizonStack}>
            <RatingBar
              color="#d97706"
              bgText="#d97706"
              textColor="#fff"
              ratingName="가성비"
              ratingData={restData['cost_performance']}
            />
          </Center>
          <Center style={style.horizonStack}>
            <RatingBar
              color="#65a30d"
              bgText="#65a30d"
              textColor="#fff"
              ratingName="서비스"
              ratingData={restData['service']}
            />
          </Center>
        </HStack>
        <View style={style.horizontalLayout}>
          <Text style={{ color: '#57534e', fontWeight: 'bold' }}>
            총 <Text style={{ color: '#292524' }}>{restData['comments_count']}</Text>명이 참여해주셨습니다.
          </Text>
        </View>
        {comments}
      </View>
    </>
  );
}

const RestaurantInfo = (props) => {
  const animatedScroll = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [restData, setData] = useState({});
  let restDir = '/식당/' + props.restId;
  const restRef = database().ref(restDir);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  useEffect(() => {
    restRef.once('value').then(data => {
      if (data) {
        setData(data.val());
      }
    });
    console.log(refreshing)
  }, [refreshing]);

  async function removeComment(commentId, queryId) {
    await restRef.child('comments/' + commentId.toString()).remove().then(() => {
      const commentsCount = restData['comments_count'];

      firestore().collection('가게').doc(restData['official_name']).collection('리뷰').doc(queryId).delete();
      if (commentsCount == 1) {
        restRef.update({
          comments_count: 0,
          flavor: 0,
          cost_performance: 0,
          service: 0,
          total: 0
        }).then(onRefresh);
      } else {
        const comment = restData['comments'][commentId];
        restRef.update({
          comments_count: commentsCount - 1,
          flavor: (restData['flavor'] * commentsCount - comment['맛']) / (commentsCount - 1),
          cost_performance: (restData['cost_performance'] * commentsCount - comment['가성비']) / (commentsCount - 1),
          service: (restData['service'] * commentsCount - comment['서비스']) / (commentsCount - 1),
          total: (restData['total'] * commentsCount - comment['종합']) / (commentsCount - 1)
        }).then(onRefresh);
      }
    });
  }

  const scrollAnimation = (animatedScroll, screenWidth) => {
    return ({
      width: screenWidth,
      height: screenWidth,
      overflow: 'hidden',
      transform: [{
        translateY: animatedScroll.interpolate({
          inputRange: [-screenWidth, 0, screenWidth, screenWidth + 1],
          outputRange: [-screenWidth * 0.3, 0, screenWidth * 0.8, screenWidth * 0.8],
        }),
      }]
    })
  }

  return (
    <SafeAreaView style={style.containter}>
      <NativeBaseProvider>
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: animatedScroll } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <RestComponent
            restData={restData}
            onPop={(id, query) => removeComment(id, query)}
            scrollAnimation={scrollAnimation(animatedScroll, Dimensions.get('window').width)}
          />
        </Animated.ScrollView>
        <CommentButton
          restaurantData={restData}
          commentsDir={restDir}
          onFinish={onRefresh}
        />
      </NativeBaseProvider>
    </SafeAreaView>
  )
}

const ItemActivity = ({ route }) => {
  const RestInfo = () => {
    return <RestaurantInfo restId={route.params.restId} />;
  }

  return (
    <NativeBaseProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="식당 정보 화면"
          component={RestInfo}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="식당 위치"
          component={MapScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NativeBaseProvider>
  );
}

export default ItemActivity;

const style = StyleSheet.create({
  containter: {
    height: '100%',
    backgroundColor: '#f5f5f5'
  },
  contexts: {
    flexDirection: 'row',
    marginBottom: 27,
  },
  partition: {
    backgroundColor: '#ffffff',
    marginTop: 3,
    paddingTop: 18,
    paddingBottom: 40
  },
  partitionPadding: {
    paddingHorizontal: 18
  },
  basicInfoPadding: {
    paddingHorizontal: 30
  },
  horizontalLayout: {
    flexDirection: 'row-reverse',
    marginVertical: 10,
    paddingBottom: 10
  },
  mapView: {
    width: '100%',
    aspectRatio: 1,
  },
  endMargin: {
    marginBottom: 100
  },
  horizonStack: {
    justifyContent: 'center',
    width: '33%',
  },
  optionView: {
    borderColor: '#ededed',
    borderRightWidth: 1.5
  },
  optionButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: 'white'
  },
})