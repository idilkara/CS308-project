from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db_connection
import logging as log

notifications_bp = Blueprint('notifications', __name__)


# Get notifications for the current user
@notifications_bp.route('/notificationsofuser', methods=['GET'])
@jwt_required()
def get_notifications():

    # Get the current user's identity
    current_user = get_jwt_identity()
    user_id = current_user['user_id']

    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Fetch notifications for the user from the database
        cursor.execute("SELECT notification_id, product_id, message, read FROM notifications WHERE user_id = ?", (user_id,))
        notifications = cursor.fetchall()

        # Convert notifications to a list of dictionaries
        notifications_list = []
        for notification in notifications:
            notifications_list.append({
                'notification_id': notification[0],
                'product_id': notification[1],
                'message': notification[2],
                'read': notification[3]
            })

        # Return the notifications as JSON
        return jsonify(notifications_list), 200

    except Exception as e:
        log.error(f"Error fetching notifications: {e}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

    finally:
        cursor.close()
        conn.close()


#set notification as read
@notifications_bp.route('/setnotificationread', methods=['PUT'])
@jwt_required()
def set_notification_read():
    # Get the current user's identity
    current_user = get_jwt_identity()
    user_id = current_user['user_id']

    # Get the request data
    data = request.get_json()
    notification_id = data.get('notification_id')

    if not notification_id:
        return jsonify({'error': 'Notification ID is required'}), 400

    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Update the notification status in the database
        cursor.execute("UPDATE notifications SET read = True WHERE notification_id = ? AND user_id = ?", (notification_id, user_id))
        conn.commit()

        # Return a success response
        return jsonify({'message': 'Notification marked as read successfully'}), 200

    except Exception as e:
        log.error(f"Error marking notification as read: {e}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

    finally:
        cursor.close()
        conn.close()


