export async function friend(friend: boolean, userid: number) {
	await fetch(`/api/account/friend`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ recipientid: userid, type: friend === true ? 'friend' : 'unfriend' })
	})
}
