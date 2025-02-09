import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Text from '../../defaultSetting/FontText';
import { IconButton, Icon } from 'native-base';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Font from 'react-native-vector-icons/FontAwesome';
import { marginBottom } from 'styled-system';

const KeyTextView = (props) => {
	return (
		<View style={style.titleView}>
			<Text style={style.keyText} bold>
				{props.keyText}
			</Text>
		</View>
	)
}

const InfoView = (props) => {
	return (
		<View style={style.contexts}>
			<View style={style.iconView}>
				<Font
					name={props.icon}
					color="#666666"
					size={22}
				/>
			</View>
			<Text style={{ fontSize: 16, marginVertical: 3 }}>
				{props.value}
			</Text>
		</View>
	)
}

const MenuListView = (props) => {
	const [food, price] = props.order.split(': ');

	return (
		<View style={style.menuView}>
			<Text style={{ fontWeight: 'bold' }}>{food}</Text>
			<Text>{price}원</Text>
		</View>
	)
}

const CommentListView = (props) => {
	const id = props.id;
	const comment = props.comment;
	const commentUser = comment['user'];

	return (
		<View style={style.commentsView}>
			<View style={style.commentHeader}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Image
						style={style.userProfile}
						source={{ uri: commentUser['profile'] }}
					/>
					<View>
						<Text style={{ fontSize: 16, marginBottom: 4 }} bold>{commentUser['name']}</Text>
						<Text style={{ fontSize: 12, textAlign: 'right', color: '#4b4b4b' }}>{comment['작성시간']}</Text>
					</View>
				</View>
				{props.user.uid === commentUser['uid'] &&
					<IconButton
						size="sm"
						borderRadius="full"
						borderWidth={1}
						onPress={() => props.onPop(id, comment.query)}
						icon={<Icon name="trash-o" as={Font} size="sm" color="#831843" />}
					/>
				}
			</View>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text style={style.commentsText}>종합 : {comment['종합']}</Text>
				<Text style={style.commentsText}>맛 : {comment['맛']}</Text>
				<Text style={style.commentsText}>가성비 : {comment['가성비']}</Text>
				<Text style={style.commentsText}>서비스 : {comment['서비스']}</Text>
			</View>
			{comment['리뷰'] !== '' &&
				<View style={style.commentsReview}>
					<Text style={style.commentsText}>
						{comment['리뷰']}
					</Text>
				</View>
			}
			{comment['배달여부'] &&
				<Text style={[style.commentsText, { textAlign: 'right' }]}>
					배달 시간 : {comment['배달시간']}분    배달비 : {comment['배달비']}원
				</Text>
			}
		</View>
	)
}

const RatingBar = (props) => {
	const backgroundText = props.bgText;
	const textColor = props.textColor;
	const ratingName = props.ratingName;
	const ratingData = props.ratingData;

	return (
		<View style={style.ratingView}>
			<View style={[style.ratingTextView, { backgroundColor: backgroundText }]}>
				<Text style={[style.ratingText, { color: textColor }]} bold>{ratingName}</Text>
			</View>
			<AnimatedCircularProgress
				tintColor={props.color}
				backgroundColor="#ddd"
				size={80}
				width={10}
				rotation={0}
				fill={!ratingData ? 0 : ratingData * 20}
				duration={1000}
			>
				{(fill) => (
					<Text style={{ fontSize: 20 }}>
						{Math.round(ratingData * 10) / 10}
					</Text>
				)}
			</AnimatedCircularProgress>
		</View>
	)
}

export { KeyTextView, InfoView, MenuListView, CommentListView, RatingBar };

const style = StyleSheet.create({
	contexts: {
		flexDirection: 'row',
		marginVertical: 6,
	},
	keyText: {
		color: '#fff',
		fontSize: 16,
		marginVertical: 7,
		marginHorizontal: 12
	},
	titleView: {
		backgroundColor: '#BF2A52',
		borderRadius: 7,
		marginVertical: 5,
		marginHorizontal: 10
	},
	iconView: {
		width: 18,
		marginRight: 10,
		justifyContent: 'center',
		alignItems: 'center'
	},
	ratingView: {
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 5
	},
	ratingTextView: {
		width: 60,
		height: 28,
		justifyContent: 'center',
		borderRadius: 50,
		marginTop: 10,
		marginBottom: 20,
		marginHorizontal: 5
	},
	ratingText: {
		textAlign: 'center',
		fontSize: 14,
	},
	menuView: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderBottomColor: '#ededed',
		borderBottomWidth: 0.5,
		paddingVertical: 5,
		paddingHorizontal: 10,
		marginBottom: 5,
		marginHorizontal: 25
	},
	commentsView: {
		borderTopWidth: 0.5,
		borderColor: '#ededed',
		width: '100%',
		paddingVertical: 20,
		paddingHorizontal: 17
	},
	commentHeader: {
		height: 50,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	commentsText: {
		color: '#1c1917',
		fontSize: 14,
		marginVertical: 7
	},
	commentsReview: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 7,
		paddingVertical: 5,
		paddingHorizontal: 10,
		marginVertical: 5,
	},
	userProfile: {
		height: 40,
		aspectRatio: 1,
		borderRadius: 20,
		marginVertical: 5,
		marginRight: 12
	}
})