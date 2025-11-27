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
                # Save template in DB
                if ( empty($_POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code']) ) {
                    return_json('error', 'Required field missing.');
                    // header('Content-Type: application/json');
                    // echo json_encode([
                    //     'status' => 'error',
                    //     'message' => 'Required fields missing.'
                    // ]);
                    // exit();
                }
                save_template($conn);
                break;

            case 'edit':
                # Update template in DB
                // header('Content-Type: application/json');

                if (empty($_POST['id'])) {
                    return_json('error', 'Template not passed.');
                    // echo json_encode([
                    //     'status' => 'error',
                    //     'message' => 'Template not passed.'
                    // ]);
                    // exit();
                }
                if (empty($__POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code']) ) {
                    return_json('error', 'Required fields missing.');
                    // echo json_encode([
                    //     'status' => 'error',
                    //     'message' => 'Required fields missing.'
                    // ]);
                    // exit();
                }

                update_template($conn);
                break;

            case 'delete':
                # Delete template from DB
                if (!isset($_POST['id'])) {
                    return_json('error', 'Template not passed.');
                    // header('Content-Type: application/json');
                    // echo json_encode([
                    //     'status'=> 'error',
                    //     'message' => 'Template not passed.'
                    // ]);
                    // exit();
                }

                delete_template($conn);
                break;

            case 'list':
                # List templates onto Dashboard
                list_templates($conn);
                break;

            case 'use':
                # sets the Template-ID into Session
                // header('Content-Type: application/json');

                if (isset($_POST['id'])) {
                    $_SESSION['use_id'] = $_POST['id'];

                    return_json('success', 'Template ready.');

                    // echo json_encode([
                    //     'status' => 'success',
                    //     'message' => 'data ready'
                    // ]);
                    // exit();
                }

                return_json('error', 'Template not passed.');

                // echo json_encode([
                //     'status'=> 'error',
                //     'message' => 'Template not passed.'
                // ]);
                // exit();
                break;

            case 'id_selected':
                # Returns data of Template-ID in Session 
                if (isset($_SESSION['use_id'])) {
                    get_template($conn);
                }

                return_json('error', 'Template not passed.');

                // header('Content-Type: application/json');
                // echo json_encode([
                //     'status' => 'error',
                //     'message' => 'Template not found'
                // ]);
                // exit();
                break;
            
            default:
                return_json('error', 'Invalid action.');
                // header('Content-Type: application/json');
                // echo json_encode([
                //     "status" => "error",
                //     "message" => "Invalid action."
                // ]);
                // exit();
                break;
        }
    }
} 
catch (\Throwable $th) {
    //throw $th;
    return_json('error', 'Error thrown by Server.');
}

function save_template($conn) {
    // header('Content-Type: application/json');

    $tname = $_POST['tname'];
    $orientation = $_POST['orientation'];
    $html_code = $_POST['html_code'];
    $bg_img = $_POST['bg_img'] ?? '';
    $opacity = $_POST['opacity'] ?? '';
    $desc = $_POST['desc'] ?? '';
    $tag = $_POST['tag'] ?? '';

    $query = "INSERT INTO templates (t_name, orientation, html_code, bg_img, opacity, description, tag)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sssssss', $tname, $orientation, $html_code, $bg_img, $opacity, $desc, $tag);

    if ($stmt->execute()) {
        return_json('success', 'Template saved successfully.');
        // echo json_encode([
        //     'status' => 'success',
        //     'message' => 'Template saved successfully.',
        //     'template_id' => $stmt->insert_id
        // ]);
        // exit();
    }

    return_json('error', 'Failed to save Template.');

    // echo json_encode([
    //     'status' => 'error',
    //     'message' => 'Failed to save template.'
    // ]);
    // exit();
}

function get_template($conn) {
    $id = $_SESSION['use_id'];

    // header('Content-Type: application/json');
    
    $query = 'SELECT * FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$row = $result->fetch_assoc()) {
        return_json('error', 'No Template Data available.');
        // echo json_encode([
        //     "status" => "error",
        //     "message" => "No Template Data available."
        // ]);
        // exit();
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

    // echo json_encode([
    //     'status' => 'success',
    //     'message' => 'Retrieved Template Successfuly.',
    //     'data' => [
    //         'tname' => $row['t_name'],
    //         'orientation' => $row['orientation'],
    //         'html_code' => $row['html_code'],
    //         'bg_img' => $row['bg_img'] ?? '',
    //         'opacity' => $row['opacity'] ?? ''
    //     ]
    // ]);
    // exit();
}

function delete_template($conn) {
    // header('Content-Type: application/json');

    $id = $_POST['id'];

    // First check if template exists
    $checkQuery = 'SELECT t_id FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result->fetch_assoc()) {
        return_json('error', 'Template does not exist.');
        // echo json_encode([
        //     "status" => "error",
        //     "message" => "Template does not exist."
        // ]);
        // exit();
    }

    // Delete query
    $deleteQuery = 'DELETE FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        return_json('success', 'Template deleted successfully.');
        // echo json_encode([
        //     "status" => "success",
        //     "message" => "Template deleted successfully."
        // ]);
        // exit();
    } else {
        return_json('error', 'Failed to delete template.');
        // echo json_encode([
        //     "status" => "error",
        //     "message" => "Failed to delete template."
        // ]);
        // exit();
    }
}


function update_template($conn) {
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

    // header('Content-Type: application/json');
    if ($stmt->execute()) {
        return_json('success', 'Template updated successfully.');
        // echo json_encode([
        //     'status' => 'success',
        //     'message' => 'Template updated successfully.'
        // ]);
        // exit();
    }

    return_json('error', 'Failed to update Template.');

    // echo json_encode([
    //     'status' => 'error',
    //     'message' => 'Failed to update template.'
    // ]);
    // exit();

}

function list_templates($conn) {
    // header('Content-Type: application/json');

    $query = "SELECT t_id, t_name, orientation, bg_img, opacity FROM templates";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if no records found
    if ($result->num_rows === 0) {
        return_json('error', 'No templates found.');
        // echo json_encode([
        //     "status" => "error",
        //     "message" => "No templates found.",
        //     "data" => []
        // ]);
        // exit();
    }

    // Fetch all templates
    $templates = [];
    while ($row = $result->fetch_assoc()) {
        $templates[] = $row;
    }
    return_json('success', 'Templates retrieved successfully.', $templates);

    // echo json_encode([
    //     "status" => "success",
    //     "message" => "Templates retrieved successfully.",
    //     "data" => $templates
    // ]);
    // exit();
}

?>