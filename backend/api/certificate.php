<?php 
session_start();

require_once __DIR__ . '/../config/db_config.php';

// common json response handler
function return_json($status, $msg, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status,
        'message' => $msg,
        'data' => $data
    ]);
    exit();
}

try {
    if (isset($_POST['action'])) {
        $action = $_POST['action'];
        switch ($action) {
            case 'create':
                # Save Certificate in DB
                if ( empty($_POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code']) ) {
                    return_json('error', 'Required field missing.');
                }
                save_cert($conn);
                break;

            case 'edit':
                # Update certificate in DB

                if (empty($_POST['id'])) {
                    return_json('error', 'Template not passed.');
                }
                if (empty($__POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code']) ) {
                    return_json('error', 'Required fields missing.');
                }

                update_cert($conn);
                break;

            case 'delete':
                # Delete certificate from DB
                if (!isset($_POST['id'])) {
                    return_json('error', 'Template not passed.');
                }

                delete_cert($conn);
                break;

            case 'list':
                # List templates onto Dashboard
                list_templates($conn);
                break;

            case 'use':
                # sets the Template-ID into Session

                if (isset($_POST['id'])) {
                    $_SESSION['use_id'] = $_POST['id'];

                    return_json('success', 'Template ready.');

                }

                return_json('error', 'Template not passed.');

                break;

            case 'id_selected':
                # Returns data of Template-ID in Session 
                if (isset($_SESSION['use_id'])) {
                    get_cert($conn);
                }

                return_json('error', 'Template not passed.');

                break;
            
            default:
                return_json('error', 'Invalid action.');
                break;
        }
    }
} 
catch (\Throwable $th) {
    //throw $th;
    return_json('error', 'Error thrown by Server.');
}

function save_cert($conn) {

    // forwarded template data
    $t_id = $_POST['t_id'];
    $tname = $_POST['tname'];
    $orientation = $_POST['orientation'];
    $html_code = $_POST['html_code'];
    $bg_img = $_POST['bg_img'] ?? '';
    $opacity = $_POST['opacity'] ?? '';
    // Certificate data
    $r_name = $_POST['r_name'];
    $course = $_POST['course'];
    $issue_date = $_POST['issue_date'];
    $purpose = $_POST['purpose'] ?? ''; 
    $u_id = $_SESSION['uid'];
    // placeholder data
    $placeholders = $_POST['pldrs']; // ['pname'=>'pval', 'pname'=>'pval', ...]

    $query = "INSERT INTO certificates ( r_name, course, issue_date, purpose, t_id, t_name, orientation, html_code, bg_img, opacity, u_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ssssisssssi', $r_name, $course, $issue_date, $purpose, $t_id, $tname, $orientation, $html_code, $bg_img, $opacity, $u_id );

    if ($stmt->execute()) {
        return_json('success', 'Template saved successfully.');
    }

    return_json('error', 'Failed to save Template.');

}

function get_cert($conn) {
    $id = $_SESSION['use_id'];
    
    $query = 'SELECT * FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$row = $result->fetch_assoc()) {
        return_json('error', 'No Template Data available.');
    }

    $data = [
            'tname' => $row['t_name'],
            'orientation' => $row['orientation'],
            'html_code' => $row['html_code'],
            'bg_img' => $row['bg_img'] ?? '',
            'opacity' => $row['opacity'] ?? '',
            'desc' => $row['description'] ?? '',
            'tag' => $row['tag'] ?? ''
    ];
    return_json('success', 'Retrieved Template Successfuly.', $data);

}

function delete_cert($conn) {

    $id = $_POST['id'];

    // First check if template exists
    $checkQuery = 'SELECT t_id FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result->fetch_assoc()) {
        return_json('error', 'Template does not exist.');
    }

    // Delete query
    $deleteQuery = 'DELETE FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        return_json('success', 'Template deleted successfully.');
    } else {
        return_json('error', 'Failed to delete template.');
    }
}


function update_cert($conn) {
    $id = $_POST['id'];
    $tname = $_POST['tname'];
    $orientation = $_POST['orientation'];
    $html_code = $_POST['html_code'];

    $bg_img = $_POST['bg_img'] ?? '';
    $opacity = $_POST['opacity'] ?? '';
    $desc = $_POST['desc'] ?? '';
    $tag = $_POST['tag'] ?? '';

    $query = "UPDATE templates 
            SET t_name = ?, orientation = ?, html_code = ?, bg_img = ?, opacity = ?, description = ?, tag = ?
            WHERE t_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sssssssi', $tname, $orientation, $html_code, $bg_img, $opacity, $desc, $tag, $id);

    if ($stmt->execute()) {
        return_json('success', 'Template updated successfully.');
    }

    return_json('error', 'Failed to update Template.');

}

function list_templates($conn) {

    $query = "SELECT t_id, t_name, orientation, bg_img, opacity FROM templates";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if no records found
    if ($result->num_rows === 0) {
        return_json('error', 'No templates found.');
    }

    // Fetch all templates
    $templates = [];
    while ($row = $result->fetch_assoc()) {
        $templates[] = $row;
    }
    return_json('success', 'Templates retrieved successfully.', $templates);

}

?>